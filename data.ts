export type Question = {
  id: string;
  text: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  content: string;
  questions: Question[];
};

export type Unit = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Subject = {
  id: string;
  title: string;
  icon: string;
  description: string;
  units: Unit[];
};

export const curriculum: Subject[] = [
  {
    id: "math",
    title: "الرياضيات",
    icon: "∑",
    description: "مفاهيم وتدريبات رياضية منظمة",
    units: [
      {
        id: "math-u1",
        title: "الأعداد والعمليات",
        lessons: [
          {
            id: "math-l1",
            title: "القيمة المكانية",
            description: "التعرف على قيمة الرقم حسب موقعه",
            content: "القيمة المكانية هي قيمة الرقم التي تتغير بحسب موقعه داخل العدد. مثال: في العدد 352، الرقم 5 في منزلة العشرات وقيمته 50.",
            questions: [
              { id:"q1", text:"ما قيمة الرقم 5 في العدد 352؟", options:["5","50","500","35"], answer:1, explanation:"الرقم 5 في منزلة العشرات، لذلك قيمته 50." },
              { id:"q2", text:"أي عدد يحتوي على 7 في منزلة المئات؟", options:["270","720","207","72"], answer:1, explanation:"في 720 يقع الرقم 7 في منزلة المئات." }
            ]
          },
          {
            id: "math-l2",
            title: "الجمع والطرح",
            description: "تدريب على العمليات الأساسية",
            content: "عند الجمع نرتب الأعداد حسب المنازل ثم نجمع من اليمين إلى اليسار. وفي الطرح نطرح الآحاد ثم العشرات ثم المئات مع الاستلاف عند الحاجة.",
            questions: [
              { id:"q3", text:"ما ناتج 25 + 17؟", options:["32","42","52","40"], answer:1, explanation:"25 + 17 = 42." }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "arabic",
    title: "اللغة العربية",
    icon: "ع",
    description: "قراءة وفهم ومفردات وقواعد",
    units: [
      {
        id: "arabic-u1",
        title: "الفهم والقراءة",
        lessons: [
          {
            id: "arabic-l1",
            title: "الفكرة الرئيسة",
            description: "تمييز الفكرة الرئيسة من التفاصيل",
            content: "الفكرة الرئيسة هي المعنى الأساسي الذي يدور حوله النص، بينما التفاصيل تدعم هذه الفكرة وتشرحها.",
            questions: [
              { id:"q4", text:"ماذا نسمي المعنى الأساسي الذي يدور حوله النص؟", options:["التفصيل","الفكرة الرئيسة","العنوان فقط","الشخصية"], answer:1, explanation:"الفكرة الرئيسة تلخص المعنى الأساسي للنص." }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "science",
    title: "العلوم",
    icon: "⚗",
    description: "مفاهيم علمية وتدريبات استكشافية",
    units: [
      {
        id: "science-u1",
        title: "المادة",
        lessons: [
          {
            id: "science-l1",
            title: "حالات المادة",
            description: "الصلبة والسائلة والغازية",
            content: "للمادة حالات متعددة، منها الصلبة والسائلة والغازية. تختلف هذه الحالات في ترتيب الجسيمات وحركتها.",
            questions: [
              { id:"q5", text:"أي حالة لها حجم وشكل ثابتان؟", options:["الغازية","السائلة","الصلبة","البلازما"], answer:2, explanation:"المادة الصلبة لها حجم وشكل ثابتان." }
            ]
          }
        ]
      }
    ]
  }
];

export function getSubject(id: string) { return curriculum.find(s => s.id === id); }
export function getLesson(subjectId: string, lessonId: string) {
  return getSubject(subjectId)?.units.flatMap(u => u.lessons).find(l => l.id === lessonId);
}