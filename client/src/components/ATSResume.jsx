const sectionStyle = { marginTop: 18 };
const headingStyle = {
  margin: '0 0 8px',
  paddingBottom: 4,
  borderBottom: '1px solid #7b8490',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '.08em',
  textTransform: 'uppercase'
};
const itemStyle = { margin: '0 0 11px', breakInside: 'avoid' };
const dateStyle = { color: '#374151', fontSize: 10, whiteSpace: 'nowrap' };

const ATSSection = ({ title, children }) => {
  const hasContent = Array.isArray(children) ? children.some(Boolean) : Boolean(children);
  if (!hasContent) return null;
  return (
    <section style={sectionStyle}>
      <h2 style={headingStyle}>{title}</h2>
      {children}
    </section>
  );
};

export default function ATSResume({ personalInfo, experience, education, skills, projects, certifications, languages, volunteerWork, awards, publications, references }) {
  const info = personalInfo || {};
  const contact = [info.email, info.phone, info.location, info.website].filter(Boolean).join('  |  ');

  return (
    <article className="ats-resume" aria-label="ATS-friendly resume preview">
      <header className="ats-resume-header">
        <h1>{info.fullName || 'Your Name'}</h1>
        {info.title && <p className="ats-resume-title">{info.title}</p>}
        {contact && <p className="ats-resume-contact">{contact}</p>}
      </header>

      <ATSSection title="Professional Summary">
        {info.summary && <p>{info.summary}</p>}
      </ATSSection>

      <ATSSection title="Skills">
        {skills?.length > 0 && <p>{skills.filter(Boolean).join('  •  ')}</p>}
      </ATSSection>

      <ATSSection title="Professional Experience">
        {experience?.filter((item) => item.role || item.company || item.description).map((item) => (
          <div style={itemStyle} key={item.id}>
            <div className="ats-resume-row">
              <strong>{[item.role, item.company].filter(Boolean).join(' | ')}</strong>
              <span style={dateStyle}>{[item.startDate, item.endDate].filter(Boolean).join(' – ')}</span>
            </div>
            {item.description && <p>{item.description}</p>}
          </div>
        ))}
      </ATSSection>

      <ATSSection title="Projects">
        {projects?.filter((item) => item.name || item.description).map((item) => (
          <div style={itemStyle} key={item.id}>
            <div className="ats-resume-row"><strong>{item.name}</strong>{item.link && <span>{item.link}</span>}</div>
            {item.technologies && <p><strong>Technologies:</strong> {item.technologies}</p>}
            {item.description && <p>{item.description}</p>}
          </div>
        ))}
      </ATSSection>

      <ATSSection title="Education">
        {education?.filter((item) => item.degree || item.school).map((item) => (
          <div style={itemStyle} key={item.id}>
            <div className="ats-resume-row">
              <strong>{[item.degree, item.school].filter(Boolean).join(' | ')}</strong>
              <span style={dateStyle}>{[item.startDate, item.endDate].filter(Boolean).join(' – ')}</span>
            </div>
            {item.description && <p>{item.description}</p>}
          </div>
        ))}
      </ATSSection>

      <ATSSection title="Certifications">
        {certifications?.filter((item) => item.name).map((item) => (
          <div style={itemStyle} key={item.id}>
            <div className="ats-resume-row"><strong>{item.name}</strong><span style={dateStyle}>{item.date}</span></div>
            {item.issuer && <p>{item.issuer}</p>}
          </div>
        ))}
      </ATSSection>

      <ATSSection title="Volunteer Experience">
        {volunteerWork?.filter((item) => item.role || item.organization).map((item) => (
          <div style={itemStyle} key={item.id}>
            <div className="ats-resume-row"><strong>{[item.role, item.organization].filter(Boolean).join(' | ')}</strong><span style={dateStyle}>{[item.startDate, item.endDate].filter(Boolean).join(' – ')}</span></div>
            {item.description && <p>{item.description}</p>}
          </div>
        ))}
      </ATSSection>

      <ATSSection title="Awards">
        {awards?.filter((item) => item.title).map((item) => (
          <div style={itemStyle} key={item.id}>
            <div className="ats-resume-row"><strong>{item.title}</strong><span style={dateStyle}>{item.date}</span></div>
            {item.issuer && <p>{item.issuer}</p>}
            {item.description && <p>{item.description}</p>}
          </div>
        ))}
      </ATSSection>

      <ATSSection title="Publications">
        {publications?.filter((item) => item.title).map((item) => (
          <div style={itemStyle} key={item.id}>
            <div className="ats-resume-row"><strong>{item.title}</strong><span style={dateStyle}>{item.date}</span></div>
            {item.publisher && <p>{item.publisher}</p>}
            {item.link && <p>{item.link}</p>}
          </div>
        ))}
      </ATSSection>

      <ATSSection title="Languages">
        {languages?.length > 0 && <p>{languages.map((item) => [item.name, item.level].filter(Boolean).join(' – ')).join('  •  ')}</p>}
      </ATSSection>

      <ATSSection title="References">
        {references?.map((item) => (
          <p style={itemStyle} key={item.id}>
            <strong>{item.name}</strong>{item.role ? `, ${item.role}` : ''}{item.company ? ` at ${item.company}` : ''}{item.contact ? ` | ${item.contact}` : ''}
          </p>
        ))}
      </ATSSection>
    </article>
  );
}
