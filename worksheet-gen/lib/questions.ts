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
    topic: "Forces & Motion",
    subtopic: "Kinematics — Equations of Motion",
    blocks: [
      {
        type: "p",
        text: "A car starts from rest and accelerates uniformly along a straight road. After travelling a displacement of $s = 40\\text{ m}$, the car reaches a final velocity of $v = 20\\text{ m/s}$.",
      },
      {
        type: "p",
        text: "Using the equation of motion:",
      },
      {
        type: "display",
        math: "v^2 = u^2 + 2as",
      },
      {
        type: "p",
        text: "calculate the acceleration $a$ of the car. Give your answer in $\\text{m/s}^2$.",
      },
    ],
  },
  {
    number: 2,
    marks: 3,
    topic: "Forces & Motion",
    subtopic: "Dynamics — Newton's Second Law",
    blocks: [
      {
        type: "p",
        text: "A vehicle of mass $m = 1200\\text{ kg}$ is travelling at $u = 30\\text{ m/s}$. The driver applies the brakes and the vehicle decelerates uniformly to rest over a distance of $s = 75\\text{ m}$.",
      },
      {
        type: "p",
        text: "(a) Show, using $v^2 = u^2 + 2as$, that the magnitude of the deceleration is $6\\text{ m/s}^2$.",
      },
      {
        type: "p",
        text: "(b) State Newton's second law of motion and apply it to calculate the braking force $F$:",
      },
      {
        type: "display",
        math: "F = ma",
      },
      {
        type: "subtext",
        text: "Give the direction of $F$ relative to the direction of motion.",
      },
    ],
  },
  {
    number: 3,
    marks: 5,
    topic: "Forces & Motion",
    subtopic: "Momentum & Impulse",
    blocks: [
      {
        type: "p",
        text: "The linear momentum $p$ of a body of mass $m$ moving at velocity $v$ is defined as:",
      },
      {
        type: "display",
        math: "p = mv",
      },
      {
        type: "p",
        text: "Newton's second law, expressed in terms of the rate of change of momentum, states:",
      },
      {
        type: "display",
        math: "F = \\frac{\\Delta p}{\\Delta t} = \\frac{m(v - u)}{\\Delta t}",
      },
      {
        type: "p",
        text: "A ball of mass $m = 0.15\\text{ kg}$ travels at $u = +12\\text{ m/s}$ and strikes a wall. It rebounds along the same line at $v = -8\\text{ m/s}$. The contact time is $\\Delta t = 0.040\\text{ s}$.",
      },
      {
        type: "p",
        text: "(a) Calculate the change in momentum $\\Delta p$ of the ball.",
      },
      {
        type: "p",
        text: "(b) Hence calculate the magnitude of the average force $F$ exerted by the wall on the ball, and state its direction.",
      },
      {
        type: "p",
        text: "(c) State the force exerted by the ball on the wall during contact, justifying your answer using Newton's third law.",
      },
    ],
  },
];
