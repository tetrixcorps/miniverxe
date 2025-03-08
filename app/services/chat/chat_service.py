class ChatService:
    def __init__(self, translation_service, dialect_analyzer):
        self.translation_service = translation_service
        self.dialect_analyzer = dialect_analyzer
        self.active_rooms = {}
        
    async def handle_message(self, room_id, user_id, message, source_lang=None):
        # Detect language if not provided
        if not source_lang:
            source_lang = await self.translation_service.detect_language(message)
            
        # Store original message
        await self.store_message(room_id, user_id, message, source_lang)
        
        # Translate message for each user in room based on their preference
        for participant in self.active_rooms[room_id]['participants']:
            if participant.user_id == user_id:
                continue  # Skip sender
                
            target_lang = participant.language_preference
            translated = await self.translation_service.translate(
                message, 
                target_lang=target_lang,
                source_lang=source_lang
            )
            
            await self.send_to_user(
                participant.user_id, 
                {
                    'type': 'chat_message',
                    'room_id': room_id,
                    'sender_id': user_id,
                    'original': message,
                    'original_lang': source_lang,
                    'translated': translated,
                    'translated_lang': target_lang
                }
            ) 