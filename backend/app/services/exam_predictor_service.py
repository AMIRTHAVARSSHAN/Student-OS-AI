from typing import Dict, Any, List

class ExamPredictorService:
    def calculate_prediction(
        self,
        quiz_average: float,          # 0-100
        topic_coverage_pct: float,    # 0-100
        flashcard_retention: float,   # 0-100
        study_hours_ratio: float,     # 0-1.5
        attendance_pct: float         # 0-100
    ) -> Dict[str, Any]:
        """
        Deterministic Exam Prediction Formula (Section 55):
        predicted = 0.30*quiz_avg + 0.25*topic_coverage + 0.20*retention + 0.15*(hours_ratio*100) + 0.10*attendance
        """
        norm_hours = min(1.0, study_hours_ratio) * 100.0

        raw_score = (
            0.30 * quiz_average +
            0.25 * topic_coverage_pct +
            0.20 * flashcard_retention +
            0.15 * norm_hours +
            0.10 * attendance_pct
        )

        predicted_score = round(min(100.0, max(0.0, raw_score)), 1)
        lower_bound = max(0, int(predicted_score - 4))
        upper_bound = min(100, int(predicted_score + 5))

        return {
            "predicted_score": predicted_score,
            "confidence_interval": f"{lower_bound} - {upper_bound}",
            "breakdown": {
                "quiz_average": quiz_average,
                "topic_coverage": topic_coverage_pct,
                "flashcard_retention": flashcard_retention,
                "study_hours_ratio": study_hours_ratio,
                "attendance": attendance_pct
            }
        }

exam_predictor_service = ExamPredictorService()
