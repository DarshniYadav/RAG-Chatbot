import asyncio
import json
import re
from datetime import datetime, timezone
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from app.utils.vector_store import get_vector_store
from app.utils.llm import get_llm


class RAGService:
    def __init__(self):
        self.llm = get_llm()
        self.vectorstore = get_vector_store()
        self.retriever = self.vectorstore.as_retriever(search_kwargs={"k": 6})

        qa_system_prompt = (
           """You are a helpful, truthful and concise assistant.
            Answer the user's question accurately and naturally.
           Follow these rules in this strict priority order:

           1. If the provided context contains information that directly helps answer the question → base your answer primarily on that context and clearly prefer it over general knowledge.
           2. If the context is irrelevant, empty, or does not contain useful information for this specific question → you may use your own up-to-date knowledge to provide a correct and helpful answer.
           3. Never make up facts or confidently state something you do not know.
           4. If the question asks for real-time or very recent information (weather, news, live scores, prices, etc.) and no current data is in the context → you may say that you don't have live data unless you are very confident the information hasn't changed recently.
           5. Keep answers clear, to-the-point and well-structured. Use bullet points, tables or short paragraphs when it improves readability.
           6. Never merge facts across different people. If context includes multiple candidates, answer only about the person requested by the user. If no person is specified and context is ambiguous, ask a short clarifying question.
           7. For resume/document questions, stay strictly grounded in the retrieved context. Do not add profile details that are not explicitly present in the context.
           8. If the user asks for exact lines or exact wording, quote the relevant lines verbatim from context and do not paraphrase those quoted lines.

          Context (only use when relevant): {context}
          """
        )
        self.qa_prompt = ChatPromptTemplate.from_messages([
            ("system", qa_system_prompt),
            ("human", "{input}"),
        ])
        self.output_parser = StrOutputParser()

    def _extract_candidate_name(self, query: str) -> str | None:
        text = (query or "").strip()
        if not text:
            return None

        patterns = [
            r"(?:candidate|resume|cv|profile)\s+(?:of\s+)?([A-Za-z][A-Za-z\s]{1,60})",
            r"(?:about|for)\s+([A-Za-z][A-Za-z\s]{1,60})",
        ]
        for pattern in patterns:
            match = re.search(pattern, text, flags=re.IGNORECASE)
            if match:
                name = re.sub(r"\s+", " ", match.group(1)).strip(" .,!?")
                if len(name.split()) <= 4:
                    return name

        return None

    def _contains_name(self, content: str, candidate_name: str) -> bool:
        if not candidate_name:
            return True
        lowered_content = (content or "").lower()
        tokens = [token for token in candidate_name.lower().split() if token]
        if not tokens:
            return True
        return all(token in lowered_content for token in tokens)

    async def _retrieve_docs(
        self,
        query: str,
        source_file: str | None = None,
        candidate_name: str | None = None,
        user_id: str | None = None,
    ):
        search_query = query or ""

        if source_file:
            try:
                scoped_docs = await self.vectorstore.asimilarity_search(
                    search_query,
                    k=8,
                    filter={"source_file": source_file},
                )
                if scoped_docs:
                    return scoped_docs
            except Exception:
                # Fallback: retrieve broadly and keep only matching source_file chunks.
                try:
                    broad_docs = await self.vectorstore.asimilarity_search(search_query, k=30)
                    strict_scoped = [
                        doc
                        for doc in broad_docs
                        if isinstance(getattr(doc, "metadata", None), dict)
                        and getattr(doc, "metadata", {}).get("source_file") == source_file
                    ]
                    return strict_scoped
                except Exception:
                    return []

            # source_file was provided but no docs matched: do NOT leak global docs.
            return []

        if user_id:
            try:
                user_docs = await self.vectorstore.asimilarity_search(
                    search_query,
                    k=8,
                    filter={"user_id": str(user_id)},
                )
            except Exception:
                user_docs = await self.retriever.ainvoke(search_query)
                user_docs = [
                    doc
                    for doc in user_docs
                    if isinstance(getattr(doc, "metadata", None), dict)
                    and str(getattr(doc, "metadata", {}).get("user_id", "")) == str(user_id)
                ]
            docs = user_docs
        else:
            docs = await self.retriever.ainvoke(search_query)

        resolved_name = (candidate_name or self._extract_candidate_name(search_query) or "").strip()
        if not resolved_name:
            return docs

        filtered_docs = [
            doc for doc in docs if self._contains_name(getattr(doc, "page_content", ""), resolved_name)
        ]

        # If a specific candidate is requested, prefer precision over recall.
        return filtered_docs if filtered_docs else []

    def _http_get_json(self, base_url: str, params: dict) -> dict:
        query = urlencode(params)
        url = f"{base_url}?{query}"
        req = Request(url, headers={"User-Agent": "RagChatbot/1.0"})
        with urlopen(req, timeout=15) as response:
            return json.loads(response.read().decode("utf-8"))

    def _extract_weather_city(self, query: str) -> str | None:
        text = query.strip()
        patterns = [
            r"(?:weather|temperature|forecast)\s+(?:in|at|for)\s+([a-zA-Z\s,.-]+)",
            r"(?:in|at)\s+([a-zA-Z\s,.-]+)\s+(?:weather|temperature|forecast)",
        ]
        for pattern in patterns:
            match = re.search(pattern, text, flags=re.IGNORECASE)
            if match:
                city = match.group(1).strip(" .?,!")
                return city if city else None
        if any(keyword in text.lower() for keyword in ["weather", "temperature", "forecast"]):
            return "Indore"
        return None

    async def _get_weather_context(self, city: str) -> str | None:
        def _fetch() -> str | None:
            geo = self._http_get_json(
                "https://geocoding-api.open-meteo.com/v1/search",
                {"name": city, "count": 1, "language": "en", "format": "json"},
            )
            results = geo.get("results") or []
            if not results:
                return None

            location = results[0]
            lat = location.get("latitude")
            lon = location.get("longitude")
            location_name = location.get("name", city)
            admin = location.get("admin1") or ""
            country = location.get("country") or ""

            weather = self._http_get_json(
                "https://api.open-meteo.com/v1/forecast",
                {
                    "latitude": lat,
                    "longitude": lon,
                    "current": "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
                    "timezone": "auto",
                },
            )
            current = weather.get("current") or {}
            if not current:
                return None

            return (
                "REALTIME_WEATHER:\n"
                f"location: {location_name}, {admin}, {country}\n"
                f"timestamp: {current.get('time')}\n"
                f"temperature_c: {current.get('temperature_2m')}\n"
                f"feels_like_c: {current.get('apparent_temperature')}\n"
                f"humidity_percent: {current.get('relative_humidity_2m')}\n"
                f"wind_kmh: {current.get('wind_speed_10m')}\n"
                f"weather_code: {current.get('weather_code')}"
            )

        return await asyncio.to_thread(_fetch)

    async def _get_web_context(self, query: str) -> str | None:
        lowered = query.lower()
        if not any(keyword in lowered for keyword in ["today", "now", "current", "latest", "live"]):
            return None

        def _fetch() -> str | None:
            data = self._http_get_json(
                "https://api.duckduckgo.com/",
                {"q": query, "format": "json", "no_html": 1, "skip_disambig": 1},
            )
            abstract = (data.get("AbstractText") or "").strip()
            heading = (data.get("Heading") or "").strip()
            answer = (data.get("Answer") or "").strip()
            if not any([abstract, heading, answer]):
                return None
            return (
                "REALTIME_WEB_SNIPPET:\n"
                f"query: {query}\n"
                f"heading: {heading}\n"
                f"answer: {answer}\n"
                f"summary: {abstract}"
            )

        return await asyncio.to_thread(_fetch)

    async def _get_realtime_context(self, query: str) -> str:
        realtime_parts: list[str] = []

        city = self._extract_weather_city(query)
        if city:
            weather_context = await self._get_weather_context(city)
            if weather_context:
                realtime_parts.append(weather_context)

        web_context = await self._get_web_context(query)
        if web_context:
            realtime_parts.append(web_context)

        return "\n\n".join(realtime_parts)

    def _format_history(self, history: list) -> str:
        if not history:
            return "No previous messages."
        return "\n".join([f"{role}: {content}" for role, content in history])

    def _format_context(self, docs: list) -> str:
        if not docs:
            return "No relevant context found."
        
        try:
            # Group chunks by source document to avoid mixing content from different files
            from collections import defaultdict
            grouped = defaultdict(list)
            
            for doc in docs:
                page_content = getattr(doc, "page_content", None)
                if page_content:
                    # Safely extract source metadata
                    try:
                        metadata = getattr(doc, "metadata", None) or {}
                        source = metadata.get("source_file", "Unknown") if isinstance(metadata, dict) else "Unknown"
                    except (AttributeError, TypeError):
                        source = "Unknown"
                    grouped[source].append(page_content)
            
            # Format context with clear document separation
            formatted_parts = []
            for source, chunks in grouped.items():
                if chunks:
                    formatted_parts.append(f"[From: {source}]")
                    formatted_parts.append("\n".join(chunks))
                    formatted_parts.append("")  # Add spacing between documents
            
            return "\n\n".join(formatted_parts) if formatted_parts else "No relevant context found."
        except Exception as e:
            # Fallback to simple formatting if anything goes wrong
            chunks = [getattr(doc, "page_content", "") for doc in docs if getattr(doc, "page_content", None)]
            return "\n\n".join(chunks) if chunks else "No relevant context found."

    async def astream_response(
        self,
        query: str,
        history: list,
        source_file: str | None = None,
        candidate_name: str | None = None,
        user_id: str | None = None,
    ):
        """Returns async generator for streaming"""
        docs = await self._retrieve_docs(
            query,
            source_file=source_file,
            candidate_name=candidate_name,
            user_id=user_id,
        )
        realtime_context = await self._get_realtime_context(query)
        docs_context = self._format_context(docs)
        combined_context = docs_context
        if realtime_context:
            combined_context = f"{realtime_context}\n\n{docs_context}" if docs_context else realtime_context

        prompt_input = {
            "input": query,
            "chat_history": self._format_history(history),
            "context": combined_context,
        }

        chain = self.qa_prompt | self.llm | self.output_parser
        async for token in chain.astream(prompt_input):
            yield token