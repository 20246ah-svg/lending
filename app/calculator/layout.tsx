import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Долговой калькулятор — сложный процент на технический долг | VibeDebt",
  description:
    "Десять параметров проекта — и расчёт того, сколько техдолг берёт с вас каждый месяц. Процентная ставка, налог на скорость, график обслуживания и горизонт остановки доставки.",
  openGraph: {
    title: "Долговой калькулятор VibeDebt",
    description:
      "Техдолг — это кредит под сложный процент. Посчитайте ежемесячную утечку, налог на скорость и срок окупаемости ремонта.",
    type: "website",
  },
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
