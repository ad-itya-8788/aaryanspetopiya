import { PageIntro } from '../components/SiteChrome.jsx';
import './HelpPage.css';

export function HelpPage() {
  const faqs = [
    {
      question: 'How do I join Aaryans Pet Paradise?',
      answer:
        'Use the Join / Register page to share your contact and address details. The registration form is ready to collect your information.',
    },
    {
      question: 'Can I find pet care information here?',
      answer:
        'Yes. Visit Explore Paradise for our pet care and community categories. We are continuing to add useful information.',
    },
    {
      question: 'How can I contact the team?',
      answer:
        'Send a message through our Contact Us form or visit the address listed on that page.',
    },
    {
      question: 'Are all services shown on this site available?',
      answer:
        'Please contact us to confirm current availability. We do not list unconfirmed services as offered.',
    },
  ];
  return (
    <div className="inner-page">
      <PageIntro
        eyebrow="We are here to help"
        title={
          <>
            How can we
            <br />
            <span>help you today?</span>
          </>
        }
        description="Browse common questions or send us a message. We’ll be happy to point you in the right direction."
      />
      <div className="help-layout">
        <div className="faq-list">
          {faqs.map((item, index) => (
            <details className="faq-item" key={item.question} open={index === 0}>
              <summary>
                {item.question}
                <span>+</span>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HelpPage;
