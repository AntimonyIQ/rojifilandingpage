import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/v1/components/ui/accordion";
import { ArrowRight } from "lucide-react";

const faqs = [
  {
    question: "What services does Rojifi offer for businesses?",
    answer:
      "We are a cross-border company. We give your business a global reach with easy access to local and international transfers, coporate FX payments, currency swap and payment collections.",
  },
  {
    question: "What currencies does Rojifi support?",
    answer:
      "Currently, Rojifi supports local collection in NGN, ZAR, KES, and international payouts across 120+ countries, including USD, EUR, GBP, CNY, and CAD",
  },
  {
    question: "How quickly can I send money internationally with Rojifi?",
    answer:
      "International Payments are completed on the same day, or T+1 in some jurisdiction",
  },
  {
    question:
      "Can I receive payments from overseas into my local business account with Rojifi?",
    answer:
      "With Rojifi's multi-currency accounts, you can send and receive money to and fro.",
  },
  /*
    {
      question: "Is Rojifi secure?",
      answer: "Yes, Rojifi is secured. Your payments are safe and secure with the Rojifi app. We've implemented high-end security tools designed to detect and prevent fraud, with real-time transaction monitoring. We also comply with global standards, such as ISO and PCI DSS, to ensure that your data is stored and processed securely."
    },
    */
  {
    question: "How do I contact Rojifi customer support?",
    answer:
      "For extra support, please reach out to us at support@rojifi.com. We are available for you around the clock.",
  },
  {
    question: "How do I open a global account with Rojifi?",
    answer: (
      <div className="flex flex-row item-center gap-1">
        To create account on Rojifi kindly click on
        <a
          href="https://use.rojifi.com/request-access"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          access link <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    ),
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-16 md:py-24 bg-gray-50">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-[300px_1fr] lg:grid-cols-[400px_1fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-muted-foreground">
              Find answers to common questions about our services, features, and
              processes. If you need further assistance, please contact our
              support team.
            </p>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {index + 1}. {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
