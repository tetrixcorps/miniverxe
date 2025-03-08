import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import asyncio
import logging
from app.core.logger import get_logger
from app.services.asr.riva_asr_service import RivaTranscriptionService
from app.services.nlp.sentiment_analyzer import SentimentAnalysisService

logger = get_logger("campaign_analyzer")

class MarketingCampaignAnalyzer:
    """Service for analyzing marketing campaigns with ML."""
    
    def __init__(self):
        self.transcription_service = RivaTranscriptionService()
        self.sentiment_analyzer = SentimentAnalysisService()
        self.initialized = False
        
    async def initialize(self):
        """Initialize required services."""
        if not self.initialized:
            await self.transcription_service.initialize()
            self.initialized = True
            
    async def analyze_campaign_calls(self, campaign_id: str, call_recordings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze call recordings from a marketing campaign."""
        if not self.initialized:
            await self.initialize()
            
        results = {
            "campaign_id": campaign_id,
            "analyzed_at": datetime.now().isoformat(),
            "total_calls": len(call_recordings),
            "call_analyses": [],
            "summary": {}
        }
        
        # Process each call recording
        for call in call_recordings:
            try:
                # Get audio content
                audio_url = call.get("recording_url")
                call_id = call.get("call_id")
                
                # Download audio (simplified for example)
                audio_content = await self._download_audio(audio_url)
                
                # Transcribe call
                transcription = await self.transcription_service.transcribe_file(
                    audio_content,
                    {
                        "language": "en-US",
                        "diarization": True,
                        "speaker_count": 2
                    }
                )
                
                # Analyze sentiment
                sentiment = await self.sentiment_analyzer.analyze_text(transcription["transcription"])
                
                # Extract key phrases and topics
                topics = await self._extract_topics(transcription["transcription"])
                
                # Analyze call outcome
                outcome = await self._determine_call_outcome(transcription["transcription"])
                
                # Calculate lead score based on various factors
                lead_score = await self._calculate_lead_score(
                    transcription["transcription"],
                    sentiment,
                    outcome
                )
                
                # Add to results
                call_analysis = {
                    "call_id": call_id,
                    "duration": call.get("duration"),
                    "timestamp": call.get("timestamp"),
                    "sentiment": sentiment,
                    "topics": topics,
                    "outcome": outcome,
                    "lead_score": lead_score,
                    "transcription_summary": transcription["transcription"][:500] + "..."
                }
                
                results["call_analyses"].append(call_analysis)
                
            except Exception as e:
                logger.error(f"Error analyzing call {call.get('call_id')}: {str(e)}")
                results["call_analyses"].append({
                    "call_id": call.get("call_id"),
                    "error": str(e)
                })
        
        # Generate campaign summary
        results["summary"] = await self._generate_campaign_summary(results["call_analyses"])
        
        return results
    
    async def _download_audio(self, url: str) -> bytes:
        """Download audio file from URL."""
        # This would actually use httpx or aiohttp to download the file
        # Simplified for example
        logger.info(f"Downloading audio from {url}")
        return b"AUDIO_CONTENT_BYTES"  # placeholder
    
    async def _extract_topics(self, text: str) -> List[str]:
        """Extract key topics from text."""
        # This would use a topic modeling approach in production
        # Simplified for example
        topics = ["pricing", "features", "competitors"]
        return topics
    
    async def _determine_call_outcome(self, text: str) -> Dict[str, Any]:
        """Determine the outcome of a sales call."""
        # This would use a classification model in production
        # Simplified for example
        outcomes = {
            "category": "qualified_lead",
            "next_steps": "schedule_demo",
            "objections": ["price", "implementation_time"],
            "confidence": 0.85
        }
        return outcomes
    
    async def _calculate_lead_score(self, text: str, sentiment: Dict[str, Any], outcome: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate a lead score based on call analysis."""
        # This would use a scoring algorithm in production
        # Simplified for example
        base_score = 65  # out of 100
        
        # Adjust for sentiment
        if sentiment["overall"] == "positive":
            base_score += 15
        elif sentiment["overall"] == "negative":
            base_score -= 20
            
        # Adjust for outcome
        if outcome["category"] == "qualified_lead":
            base_score += 10
        
        # Final scoring
        return {
            "score": min(100, max(0, base_score)),  # Ensure between 0-100
            "tier": "A" if base_score >= 80 else "B" if base_score >= 60 else "C",
            "conversion_probability": base_score / 100
        }
    
    async def _generate_campaign_summary(self, call_analyses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate a summary of campaign performance."""
        # Calculate overall metrics
        total_analyzed = len([c for c in call_analyses if "error" not in c])
        if total_analyzed == 0:
            return {"error": "No successful call analyses"}
            
        qualified_leads = len([c for c in call_analyses if 
                              "outcome" in c and c["outcome"].get("category") == "qualified_lead"])
        
        avg_lead_score = sum([c.get("lead_score", {}).get("score", 0) for c in call_analyses 
                              if "lead_score" in c]) / total_analyzed
        
        # Sentiment distribution
        sentiment_counts = {
            "positive": len([c for c in call_analyses if 
                           "sentiment" in c and c["sentiment"].get("overall") == "positive"]),
            "neutral": len([c for c in call_analyses if 
                          "sentiment" in c and c["sentiment"].get("overall") == "neutral"]),
            "negative": len([c for c in call_analyses if 
                           "sentiment" in c and c["sentiment"].get("overall") == "negative"])
        }
        
        # Common topics
        all_topics = []
        for call in call_analyses:
            if "topics" in call:
                all_topics.extend(call["topics"])
                
        topic_frequency = {}
        for topic in all_topics:
            topic_frequency[topic] = topic_frequency.get(topic, 0) + 1
            
        top_topics = sorted(topic_frequency.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "qualified_lead_rate": qualified_leads / total_analyzed if total_analyzed > 0 else 0,
            "average_lead_score": avg_lead_score,
            "sentiment_distribution": sentiment_counts,
            "top_topics": top_topics,
            "total_analyzed": total_analyzed,
            "conversion_projection": qualified_leads * 0.3  # Simplified projection
        } 