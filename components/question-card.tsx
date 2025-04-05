"use client"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormControl from "@mui/material/FormControl"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import Alert from "@mui/material/Alert"

export default function QuestionCard({
  question,
  index,
  selectedAnswer,
  onAnswerChange,
  isSubmitted,
  testType = "practice",
}) {
  const handleChange = (event) => {
    onAnswerChange(question.id, event.target.value)
  }

  const isCorrect = selectedAnswer === question.correct_answer

  return (
    <Card sx={{ mb: 3, boxShadow: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" component="div">
            Question {index + 1}
          </Typography>
          {testType === "practice" && (
            <Box>
              {question.tags.split(", ").map((tag) => (
                <Chip key={tag} label={tag} size="small" color="primary" variant="outlined" sx={{ mr: 0.5 }} />
              ))}
            </Box>
          )}
        </Box>

        <Typography variant="body1" sx={{ mb: 3 }}>
          {question.question}
        </Typography>

        <FormControl component="fieldset" sx={{ width: "100%" }}>
          <RadioGroup value={selectedAnswer} onChange={handleChange}>
            {["A", "B", "C", "D"].map((option) => (
              <FormControlLabel
                key={option}
                value={option}
                control={
                  <Radio
                    disabled={isSubmitted}
                    color={
                      isSubmitted
                        ? option === question.correct_answer
                          ? "success"
                          : selectedAnswer === option && option !== question.correct_answer
                            ? "error"
                            : "primary"
                        : "primary"
                    }
                  />
                }
                label={
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: isSubmitted && option === question.correct_answer ? "bold" : "normal",
                      color: isSubmitted && option === question.correct_answer ? "success.main" : "text.primary",
                    }}
                  >
                    {option}: {question[`option_${option}`]}
                  </Typography>
                }
                sx={{
                  mb: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: isSubmitted
                    ? option === question.correct_answer
                      ? "success.light"
                      : selectedAnswer === option && option !== question.correct_answer
                        ? "error.light"
                        : "transparent"
                    : "transparent",
                  opacity: isSubmitted && option !== question.correct_answer && selectedAnswer !== option ? 0.7 : 1,
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {isSubmitted && (
          <Alert severity={isCorrect ? "success" : "error"} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </Typography>
            <Typography variant="body2">{question.explanation}</Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

