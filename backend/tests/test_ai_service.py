from app.services.ai_service import ai_service

def test_system_prompt_language_adaptation():
    context = {"user_name": "Priya", "subscription_tier": "scholar"}
    
    prompt_en = ai_service.build_system_prompt(context, language="en")
    assert "Respond in English." in prompt_en
    
    prompt_ta = ai_service.build_system_prompt(context, language="ta")
    assert "Respond in Tamil." in prompt_ta

    prompt_tanglish = ai_service.build_system_prompt(context, language="tanglish")
    assert "mixing Tamil and English" in prompt_tanglish
