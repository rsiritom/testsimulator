import { NextResponse } from "next/server"

// Datos de ejemplo para el simulador
export const examQuestions = [
  {
    checked: 1,
    correct_answer: "D",
    explanation:
      "Option D accurately describes FDD, which emphasizes developing a high-level model and focusing on feature-based development. FDD involves creating a clear understanding of desired features and ensuring that all team members are aligned in their approach to design and implementation. The PMBOK Guide emphasizes the need for clear planning and scope definition, aligning well with this option. Options A and B misinterpret the nature of FDD, as they focus more on reliance or showcasing rather than the structured approach to development. Option C does not capture the essence of FDD at all.",
    id: "Q0717",
    option_A: "Your team will rely on previous feature designs for your work",
    option_B: "Your team will feature certain abilities and showcase them to other teams",
    option_C: "Your team enjoys the feature of working with agile in an agile organization",
    option_D: "Your team will try developing an overall model and plan, designing and building by those features",
    question:
      "An executive approaches you about trying Feature-Driven Development (FDD) in your team. What does this entail?",
    tags: "Quality, Scope",
  },
  {
    checked: 1,
    correct_answer: "D",
    explanation:
      "As a project manager, it is critical to ensure that the project's expected benefits are clearly defined and aligned with the organization's strategic objectives. By consulting with project stakeholders to identify and document the expected benefits of the CRM system, you facilitate a shared understanding of the project's goals and ensure alignment with organizational strategy. This proactive approach helps prevent misunderstandings and ensures that the project delivers value to the organization. Proceeding without clarifying the benefits could result in a misaligned project that fails to meet strategic objectives. Delaying the project or assuming benefits without proper documentation are not best practices in project management.",
    id: "Q0525",
    option_A:
      "Assume that the benefits are obvious and proceed, ensuring that the technical aspects meet industry standards.",
    option_B: "Proceed with the project as planned, focusing on delivering the CRM system on time and within budget.",
    option_C: "Delay the project until senior management provides a benefits realization plan.",
    option_D: "Consult with project stakeholders to identify and document the expected benefits of the CRM system.",
    question:
      "As a project manager assigned to implement a new customer relationship management (CRM) system for your company, you review the project charter and initial documents. You notice that the expected benefits of the project, such as increased sales, improved customer satisfaction, or enhanced operational efficiency, have not been clearly defined or documented. What should you do next to ensure the project's alignment with organizational strategy? ",
    tags: "Scope, Stakeholders",
  },
  {
    checked: 1,
    correct_answer: "A",
    explanation:
      "The project manager should first analyze the impact of the change on the project schedule, scope, and budget. This analysis will provide the necessary information to make an informed decision about the change request. Options B, C, and D represent actions that would be taken after the impact analysis is complete, not as the first step in the change management process.",
    id: "Q0301",
    option_A: "Analyze the impact of the change on the project schedule, scope, and budget",
    option_B: "Implement the change immediately to avoid delays in the project timeline",
    option_C: "Reject the change request as it was not part of the original project scope",
    option_D: "Escalate the change request to the project sponsor for immediate approval",
    question:
      "During the execution of a software development project, a key stakeholder requests a significant feature addition that was not part of the original requirements. As the project manager, what should be your FIRST action?",
    tags: "Change, Integration",
  },
  {
    checked: 1,
    correct_answer: "C",
    explanation:
      "The critical path is the sequence of activities that determines the earliest completion date of the project. It represents the longest path through the project network diagram and has zero total float. Any delay in an activity on the critical path will delay the entire project unless corrective action is taken. Options A, B, and D are incorrect as they do not accurately describe the critical path in project management.",
    id: "Q0402",
    option_A: "The path with the most resource-intensive activities in the project",
    option_B: "The sequence of activities with the highest risk factors in the project",
    option_C: "The sequence of activities that determines the earliest completion date of the project",
    option_D: "The path that requires the most experienced team members to complete",
    question: "In project schedule management, what does the critical path represent?",
    tags: "Schedule, Time",
  },
  {
    checked: 1,
    correct_answer: "B",
    explanation:
      "Earned Value Management (EVM) is a project management technique that integrates scope, schedule, and resources to measure project performance and progress. It compares the amount of work planned with what has been actually accomplished to determine if cost and schedule performance are as planned. Options A, C, and D do not accurately describe the primary purpose of EVM.",
    id: "Q0503",
    option_A: "To allocate resources efficiently across multiple projects in a portfolio",
    option_B: "To measure project performance and progress by comparing planned work to completed work",
    option_C: "To identify and prioritize project risks based on their probability and impact",
    option_D: "To determine the optimal sequence of activities to minimize project duration",
    question: "What is the primary purpose of Earned Value Management (EVM) in project management?",
    tags: "Cost, Performance",
  },
  {
    checked: 1,
    correct_answer: "A",
    explanation:
      "A risk register is a document that contains the results of various risk management processes and is often displayed in a table format. It is a tool for documenting potential risk events and their characteristics, providing a record of identified risks including results of risk analysis and planned responses. Options B, C, and D describe other project management documents or techniques, not the risk register.",
    id: "Q0604",
    option_A: "A document that records identified risks, their analysis, and planned responses",
    option_B: "A financial reserve established to cover unforeseen project costs",
    option_C: "A diagram that illustrates the logical relationships among project activities",
    option_D: "A technique for evaluating project performance against established baselines",
    question: "In project risk management, what is a risk register?",
    tags: "Risk, Documentation",
  },
  {
    checked: 1,
    correct_answer: "D",
    explanation:
      "The power/interest grid is a stakeholder analysis tool that categorizes stakeholders based on their level of authority (power) and their level of concern (interest) regarding project outcomes. This helps project managers develop appropriate management strategies for engaging different stakeholder groups. Options A, B, and C describe other project management tools or techniques, not the power/interest grid.",
    id: "Q0705",
    option_A: "A technique for resolving conflicts among project team members",
    option_B: "A method for allocating resources based on activity priorities",
    option_C: "A tool for measuring the performance of individual team members",
    option_D:
      "A stakeholder analysis tool that categorizes stakeholders based on their level of authority and interest",
    question: "What is the purpose of a power/interest grid in project stakeholder management?",
    tags: "Stakeholders, Communication",
  },
  {
    checked: 1,
    correct_answer: "C",
    explanation:
      "Progressive elaboration is the iterative process of increasing the level of detail in a project management plan as greater amounts of information and more accurate estimates become available. This concept recognizes that planning is not a one-time event but continues throughout the project lifecycle. Options A, B, and D describe other project management concepts, not progressive elaboration.",
    id: "Q0806",
    option_A: "The process of breaking down project deliverables into smaller, more manageable components",
    option_B:
      "A technique for accelerating project schedule by overlapping activities that would normally be performed in sequence",
    option_C:
      "The iterative process of increasing the level of detail in a project plan as more information becomes available",
    option_D:
      "The method of distributing project information to stakeholders according to their needs and expectations",
    question: "What does the term 'progressive elaboration' mean in project management?",
    tags: "Planning, Integration",
  },
  {
    checked: 1,
    correct_answer: "B",
    explanation:
      "A project charter is a document issued by the project initiator or sponsor that formally authorizes the existence of a project and provides the project manager with the authority to apply organizational resources to project activities. It serves as the foundation document that formally recognizes and establishes a project. Options A, C, and D describe other project management documents or tools, not the project charter.",
    id: "Q0907",
    option_A: "A detailed description of the project scope, deliverables, and requirements",
    option_B:
      "A document that formally authorizes the existence of a project and provides the project manager with authority",
    option_C: "A plan that defines how the project will be executed, monitored, and controlled",
    option_D: "A document that outlines the expected benefits and return on investment for the project",
    question: "What is the primary purpose of a project charter in project management?",
    tags: "Initiation, Integration",
  },
  {
    checked: 1,
    correct_answer: "A",
    explanation:
      "Quality assurance focuses on the processes used to manage and deliver solutions. It involves evaluating whether the project is adhering to its planned quality processes and standards. Quality assurance is preventive in nature, aiming to prevent defects before they occur. Options B, C, and D describe other quality management concepts, not quality assurance.",
    id: "Q1008",
    option_A:
      "The process of evaluating overall project performance to ensure the project will satisfy the relevant quality standards",
    option_B: "The process of inspecting deliverables to determine if they comply with requirements",
    option_C: "The process of defining quality requirements and standards for the project and product",
    option_D: "The process of monitoring specific project results to determine if they comply with quality standards",
    question: "In project quality management, what is quality assurance?",
    tags: "Quality, Process",
  },
  {
    checked: 1,
    correct_answer: "C",
    explanation:
      "A work breakdown structure (WBS) is a hierarchical decomposition of the total scope of work to be carried out by the project team to accomplish the project objectives and create the required deliverables. It organizes and defines the total scope of the project and represents the work specified in the current approved project scope statement. Options A, B, and D describe other project management tools or techniques, not the WBS.",
    id: "Q1109",
    option_A: "A document that outlines the sequence of activities and their dependencies in a project",
    option_B: "A method for estimating project costs based on historical data from similar projects",
    option_C: "A hierarchical decomposition of the total scope of work to be carried out by the project team",
    option_D: "A technique for identifying and analyzing potential risks that might impact the project",
    question: "What is a Work Breakdown Structure (WBS) in project management?",
    tags: "Scope, Planning",
  },
]

export async function GET(request: Request) {
  // Obtener el parámetro table_name de la URL
  const url = new URL(request.url)
  const tableName = url.searchParams.get("table_name") || "pmpquestions"

  // Simular un pequeño retraso para mostrar el estado de carga
  await new Promise((resolve) => setTimeout(resolve, 800))

  // En un entorno real, aquí se haría una consulta a la base de datos
  // usando el tableName para seleccionar la tabla correcta
  // Por ahora, simplemente devolvemos los datos de ejemplo

  return NextResponse.json(examQuestions)
}

