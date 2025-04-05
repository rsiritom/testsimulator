"use client"

import { useState, useEffect } from "react"

// Lista completa de frases motivacionales
const motivationalQuotes = [
  "Success begins with preparation—study smart, achieve big!",
  "Every question is an opportunity to prove your knowledge.",
  "Confidence comes from consistent effort—keep going!",
  "One step closer to your certification with every answer.",
  "Progress, not perfection, leads to mastery.",
  "Hard work beats talent when talent doesn't work hard.",
  "The secret to success? Study today, succeed tomorrow!",
  "Don't stop when you're tired, stop when you're done.",
  "The only limit to your success is your mindset.",
  "Knowledge is like a muscle—the more you use it, the stronger it gets.",
  "Stay focused, stay determined, and make it happen!",
  "You're not just studying for an exam; you're building your future.",
  "The more you practice, the more confident you become.",
  "You are capable of more than you think—keep pushing forward!",
  "Every expert was once a beginner—keep learning!",
  "Your future self will thank you for the effort you put in today.",
  "The best way to predict your success is to prepare for it.",
  "Don't wish for it, work for it!",
  "You are closer than you think—keep going!",
  "A little progress each day adds up to big results.",
  "Discipline today, success tomorrow.",
  "The road to success is paved with consistent effort.",
  "You don't fail until you stop trying.",
  "Your certification is within reach—one question at a time.",
  "Every study session brings you closer to your goal.",
  "The journey to success starts with a single step—keep moving forward!",
  "Believe in yourself, and you're halfway there.",
  "Study with purpose, pass with confidence.",
  "Challenges make you stronger—embrace them!",
  "Don't stop now—you're on the brink of greatness.",
  "Make progress, not excuses.",
  "You control your success—study with intention!",
  "Doubt kills more dreams than failure ever will.",
  "Consistency is key—stay dedicated to your goal!",
  "Your hard work will pay off—keep pushing forward!",
  "Today's effort is tomorrow's success.",
  "Keep your goal in mind and push through the doubts!",
  "Learning is a journey, and you're on the right path.",
  "Great things come to those who prepare.",
  "Strength grows in the moments you think you can't go on.",
  "Stay disciplined, stay motivated, stay winning!",
  "A strong mind leads to a strong future—keep learning!",
  "Exams don't define you, but preparation does.",
  "Focus on progress, not perfection.",
  "One right answer at a time—just keep going!",
  "It's not about being the best, it's about being better than yesterday.",
  "Winners never quit, and quitters never win.",
  "Keep going—your breakthrough is just ahead.",
  "Every small effort compounds into great success.",
  "Study like your dreams depend on it—because they do!",
  "Growth happens outside your comfort zone—push yourself!",
  "Success is built on daily improvement.",
  "The best investment you can make is in yourself.",
  "Learning never exhausts the mind—it strengthens it!",
  "When you feel like stopping, remember why you started.",
  "Study hard now, celebrate later.",
  "You were made for great things—go prove it!",
  "Doubt your doubts before you doubt yourself.",
  "It's not about how fast, but how well you learn.",
  "Keep learning, keep growing, keep succeeding!",
  "Let today's challenge become tomorrow's success story.",
  "Your dedication determines your destination.",
  "The only way to fail is to stop trying.",
  "Your goal is closer than it seems—keep pushing!",
  "Nothing worth having comes easy—keep going!",
  "A positive mindset fuels a successful outcome.",
  "Turn pressure into power—use it to succeed!",
  "What seems hard now will soon be second nature.",
  "Success favors the prepared—so prepare well!",
  "Strive for progress, not just results.",
  "Smart study beats long hours—work effectively!",
  "Focus on effort, and results will follow.",
  "Never stop learning—it's the key to success.",
  "The exam is temporary, but your knowledge lasts forever.",
  "Trust your preparation and do your best!",
  "One more question right, one step closer to success.",
  "Every challenge you overcome makes you stronger.",
  "Stay positive, stay focused, stay determined.",
  "Your time and effort are investments in your future.",
  "The harder the battle, the sweeter the victory.",
  "Learning today leads to leading tomorrow.",
  "Aim high, study smart, and achieve greatness!",
  "Champions keep studying when others rest.",
  "Every attempt brings you closer to success.",
  "Stay patient, stay consistent, stay winning.",
  "Your success story is being written—keep going!",
  "Learning is a superpower—use it wisely!",
  "A prepared mind is a confident mind.",
  "Keep up the momentum—you're doing great!",
  "Your effort today shapes your success tomorrow.",
  "Learning is your ladder to success—climb with confidence!",
  "Mistakes are proof that you are learning.",
  "Knowledge fuels confidence—keep absorbing!",
  "You don't have to be perfect, just persistent.",
  "Your dream certification is closer than you think!",
  "Face the challenge, conquer the exam!",
  "Learning is an adventure—enjoy the journey!",
  "No shortcuts to success—just hard work and commitment!",
  "Keep your eyes on the prize and study with purpose.",
  "Your dedication today will define your success tomorrow!",
]

export function useMotivationalQuotes() {
  const [quote, setQuote] = useState("")

  // Obtener una cita aleatoria
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
    return motivationalQuotes[randomIndex]
  }

  // Inicializar con una cita aleatoria
  useEffect(() => {
    setQuote(getRandomQuote())
  }, [])

  // Función para obtener una nueva cita aleatoria
  const refreshQuote = () => {
    setQuote(getRandomQuote())
  }

  return { quote, refreshQuote }
}

