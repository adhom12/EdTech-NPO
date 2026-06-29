import type { Block } from "./renderMath";

export interface Question {
  id?: string;
  number: number;
  marks: number;
  blocks: Block[];
  verified?: boolean;
  source?: string;
  topic?: string;
  subtopic?: string;
}

export const INITIAL_QUESTIONS: Question[] = [
  {
    number: 1,
    marks: 2,
    topic: "Algebra",
    subtopic: "Solving Quadratic Equations",
    blocks: [
      {
        type: "p",
        text: "Solve the equation",
      },
      {
        type: "display",
        math: "2x^2 - 5x - 3 = 0",
      },
      {
        type: "subtext",
        text: "Show all working clearly.",
      },
    ],
  },
  {
    number: 2,
    marks: 3,
    topic: "Geometry & Mensuration",
    subtopic: "Circle Theorems",
    blocks: [
      {
        type: "p",
        text: "Points $A$, $B$ and $C$ lie on a circle with centre $O$. The angle $\\angle AOB = 112°$.",
      },
      {
        type: "p",
        text: "(a) Find the angle $\\angle ACB$.",
      },
      {
        type: "p",
        text: "(b) Point $D$ lies on the major arc $AB$. Find the angle $\\angle ADB$.",
      },
      {
        type: "subtext",
        text: "Give reasons for each answer.",
      },
    ],
  },
  {
    number: 3,
    marks: 5,
    topic: "Statistics & Probability",
    subtopic: "Probability — Combined Events",
    blocks: [
      {
        type: "p",
        text: "A bag contains 5 red counters and 3 blue counters. Two counters are drawn at random without replacement.",
      },
      {
        type: "p",
        text: "(a) Complete the tree diagram for the two draws.",
      },
      {
        type: "p",
        text: "(b) Find the probability that both counters are the same colour.",
      },
      {
        type: "p",
        text: "(c) Given that the first counter drawn is red, find the probability that the second counter is also red.",
      },
      {
        type: "subtext",
        text: "Give all probabilities as fractions in their simplest form.",
      },
    ],
  },
];
