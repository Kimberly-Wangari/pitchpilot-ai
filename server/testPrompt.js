
const {
  buildConversationPrompt,
} = require("./src/services/promptService");

const scenario = {
  title: "Competitor Comparison",
  category: "Sales",
  difficulty: "intermediate",
  customer_persona:
    "A customer comparing two competing solutions.",
  situation:
    "The customer believes a competitor offers better value.",
  objective:
    "Help the sales agent practice competitive positioning.",
  target_competencies: [
    "Objection Handling",
    "Communication",
    "Needs Discovery",
  ],
};

const history = [
  {
    sender: "agent",
    content: "Hello, what are you looking for?",
  },
  {
    sender: "customer",
    content: "I'm comparing your product with another company.",
  },
];

const messages = buildConversationPrompt(scenario, history);

console.log(JSON.stringify(messages, null, 2));
