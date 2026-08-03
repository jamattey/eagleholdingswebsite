const fs = require('fs');

const initialChecklistStr = `const initialChecklist = [
  // ─── Entity & Principal Compliance ───
  {
    id: 'item-01',
    category: 'entity',
    categoryLabel: 'Entity & Principal KYC',
    title: 'Personal KYC & Passport Verification',
    description: 'Notarized government ID and proof of residence for all project principals and directors.',
    status: 'Verified',
    ref: 'DOC-KYC-991',
  },
  {
    id: 'item-02',
    category: 'entity',
    categoryLabel: 'Entity & Principal KYC',
    title: 'Ultimate Beneficial Owner (UBO) Disclosures',
    description: 'Corporate ownership breakdown certifying all beneficiaries meeting the applicable threshold.',
    status: 'Verified',
    ref: 'DOC-UBO-402',
  },
  {
    id: 'item-03',
    category: 'entity',
    categoryLabel: 'Entity & Principal KYC',
    title: 'Politically Exposed Person (PEP) Declarations',
    description: 'PEP declarations for all directors, signatories, and equity-investor UBOs.',
    status: 'Pending Upload',
    ref: 'DOC-PEP-REQ',
  },
  {
    id: 'item-04',
    category: 'entity',
    categoryLabel: 'Entity & Principal KYC',
    title: 'Mandatory Corporate Verification Documents',
    description: 'Certificate of Incorporation, M&A, Register of Directors, and recent Audited Financials.',
    status: 'Under Audit',
    ref: 'DOC-CORP-112',
  },

  // ─── Project Technical & Permits ───
  {
    id: 'item-05',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Ghana Regulatory & Land Title Documentation',
    description: 'Land lease/title registration (Lands Commission), GIPC Certificate, and Ghana Tourism Authority license.',
    status: 'Pending Upload',
    ref: 'DOC-LAND-REQ',
  },
  {
    id: 'item-06',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Feasibility Studies',
    description: 'Comprehensive analysis of project viability, market conditions, and economic feasibility.',
    status: 'Pending Upload',
    ref: 'DOC-TECH-001',
  },
  {
    id: 'item-07',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Geotech Report',
    description: 'Detailed analysis of subsurface conditions, including ground stability and foundation requirements.',
    status: 'Pending Upload',
    ref: 'DOC-TECH-002',
  },
  {
    id: 'item-08',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Soil Test',
    description: 'Certified soil borings and composition analysis.',
    status: 'Pending Upload',
    ref: 'DOC-TECH-003',
  },
  {
    id: 'item-09',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Structural Design',
    description: 'Detailed structural engineering blueprints and calculations.',
    status: 'Pending Upload',
    ref: 'DOC-TECH-004',
  },
  {
    id: 'item-10',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Full Plans with Quantities',
    description: 'Complete architectural plans accompanied by a detailed Bill of Quantities (BoQ).',
    status: 'Pending Upload',
    ref: 'DOC-TECH-005',
  },
  {
    id: 'item-11',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Electrical Designs',
    description: 'Stamped electrical schematics, load calculations, and power distribution plans.',
    status: 'Pending Upload',
    ref: 'DOC-TECH-006',
  },
  {
    id: 'item-12',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Sewage and Trash Disposal',
    description: 'Waste management plans, including sewage treatment and solid waste disposal strategies.',
    status: 'Pending Upload',
    ref: 'DOC-TECH-007',
  },
  {
    id: 'item-13',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Permits',
    description: 'All necessary local and national construction and operational permits.',
    status: 'Pending Upload',
    ref: 'DOC-TECH-008',
  },
  {
    id: 'item-14',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Licenses',
    description: 'Required commercial, hospitality, and operational licenses.',
    status: 'Pending Upload',
    ref: 'DOC-TECH-009',
  },
  {
    id: 'item-15',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Civil Design',
    description: 'Site civil engineering designs, including grading, drainage, and infrastructure layouts.',
    status: 'Pending Upload',
    ref: 'DOC-TECH-010',
  },
  {
    id: 'item-16',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Environmental Assessment',
    description: 'EPA environmental permit and environmental impact assessment aligned with regulatory standards.',
    status: 'Action Required',
    ref: 'DOC-TECH-011',
  },

  // ─── Financial & Legal Contracts ───
  {
    id: 'item-17',
    category: 'financial',
    categoryLabel: 'Financial & Legal Compliance',
    title: 'Corporate Banking Credentials & CIS',
    description: 'Client Information Sheet (CIS) and bank reference letter dated within 30 days.',
    status: 'Under Audit',
    ref: 'DOC-CIS-108',
  },
  {
    id: 'item-18',
    category: 'financial',
    categoryLabel: 'Financial & Legal Compliance',
    title: 'Source of Funds & Equity Proof',
    description: 'Evidence of sponsor equity contribution, source of wealth, and finalized financial model.',
    status: 'Action Required',
    ref: 'DOC-SOF-PENDING',
  },
  {
    id: 'item-19',
    category: 'financial',
    categoryLabel: 'Financial & Legal Compliance',
    title: 'Executed EPC / Construction Contract',
    description: 'Finalized Engineering, Procurement & Construction contract with the primary contractor.',
    status: 'Pending Upload',
    ref: 'DOC-EPC-REQ',
  },
  {
    id: 'item-20',
    category: 'financial',
    categoryLabel: 'Financial & Legal Compliance',
    title: 'Hotel Management or Franchise Agreement',
    description: 'Executed management contract or franchise agreement with the designated hotel operator.',
    status: 'Pending Upload',
    ref: 'DOC-HMA-REQ',
  }
];`;

let code = fs.readFileSync('src/app/onboarding/page.js', 'utf8');
code = code.replace(/\r\n/g, '\n');

code = code.replace(/const initialChecklist = \[[\s\S]*?\];/m, initialChecklistStr);
code = code.replace(
  "const [activeTab, setActiveTab] = useState('all');",
  "const [activeView, setActiveView] = useState('dashboard');\n  const [activeTab, setActiveTab] = useState('all');"
);

const mainContainerIndex = code.indexOf('<div className={styles.container}>');

const getBlock = (markerStart, markerEnd) => {
    const s = code.indexOf(markerStart);
    if (s === -1) return '';
    const e = code.indexOf(markerEnd, s);
    if (e === -1) return '';
    const endStrLength = markerEnd.length;
    return code.substring(s, e + endStrLength);
}

const adminInviteContent = getBlock('<div className={styles.inviteCard}>', '          )}');
const offerCardContent = getBlock('<div className={styles.offerCard}>', '          </div>');
// Specifically extracting just the blur overlay snippet
const blurOverlayContent = getBlock('{userRole === \'principal\' && !principalSession && (', '              )}');
const checklistItemContent = getBlock('<div key={item.id} className={styles.checklistItem}>', '                ))}').replace('                ))}', '').trim();


let replacementJSX = `<div className={styles.container}>
          <div className={styles.mainNavTabs}>
            <button 
              className={\`\${styles.mainNavBtn} \${activeView === 'dashboard' ? styles.activeMainNav : ''}\`}
              onClick={() => setActiveView('dashboard')}
            >
              Dashboard View
            </button>
            <button 
              className={\`\${styles.mainNavBtn} \${activeView === 'submission' ? styles.activeMainNav : ''}\`}
              onClick={() => setActiveView('submission')}
            >
              Data Submission Dropzone
            </button>
            <button 
              className={\`\${styles.mainNavBtn} \${activeView === 'dataroom' ? styles.activeMainNav : ''}\`}
              onClick={() => setActiveView('dataroom')}
            >
              Virtual Data Room
            </button>
          </div>

          {uploadNotice && (
            <div style={{
              padding: '14px 20px',
              background: 'rgba(168, 140, 58, 0.15)',
              border: '1px solid var(--gold)',
              borderRadius: '4px',
              color: 'var(--foreground)',
              fontSize: '0.9rem',
              marginBottom: '20px'
            }}>
              ✓ {uploadNotice}
            </div>
          )}

          {adminNotice && (
            <div style={{
              padding: '14px 20px',
              background: 'rgba(46, 204, 113, 0.15)',
              border: '1px solid #2ecc71',
              borderRadius: '4px',
              color: '#2ecc71',
              fontSize: '0.9rem',
              marginBottom: '20px'
            }}>
              🛡️ {adminNotice}
            </div>
          )}

          {userRole === 'principal' && !principalSession && (
            <div style={{
              padding: '16px 22px',
              background: 'rgba(168, 140, 58, 0.08)',
              border: '1px dashed var(--gold)',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div>
                <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: '4px' }}>Project Principal Login Recommended</strong>
                <span style={{ fontSize: '0.88rem', opacity: 0.8 }}>Log in with your sponsor credentials to access your saved project data room and custom term sheets.</span>
              </div>
              <button 
                onClick={() => router.push('/login?type=principal')}
                className={styles.loginBtn}
              >
                Login as Principal to Access
              </button>
            </div>
          )}

          {activeView === 'dashboard' && (
            <div className={styles.viewSection}>
              {userRole === 'admin' && principalSession?.role === 'ADMIN' && (
                ${adminInviteContent.replace(/<div className=\{styles\.inviteCard\}>/, '<div className={styles.inviteCard}>\n')}
              )}
              ${offerCardContent}
            </div>
          )}

          {activeView === 'submission' && (
            <div className={styles.viewSection}>
              <div className={styles.sectionHeader}>
                <h2>File & Data Submission</h2>
                <p>Upload missing documentation and complete required action items to advance compliance clearance.</p>
              </div>
              <div className={userRole === 'principal' && !principalSession ? styles.blurredContainer : ''}>
                ${blurOverlayContent}
                <div className={\`\${styles.checklistGrid} \${userRole === 'principal' && !principalSession ? styles.blurredGrid : ''}\`}>
                  {checklist.filter(item => item.status !== 'Verified').map((item) => (
                    ${checklistItemContent}
                  ))}
                  {checklist.filter(item => item.status !== 'Verified').length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', opacity: 0.6 }}>
                      No pending items. All files have been submitted and verified.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeView === 'dataroom' && (
            <div className={styles.viewSection}>
              <div className={styles.sectionHeader}>
                <h2>Virtual Data Room</h2>
                <p>Comprehensive repository of all project documents, categorised by compliance area.</p>
              </div>
              <div className={styles.tabGroup}>
                <button 
                  className={\`\${styles.tabBtn} \${activeTab === 'all' ? styles.activeTab : ''}\`}
                  onClick={() => setActiveTab('all')}
                >
                  All Items ({checklist.length})
                </button>
                <button 
                  className={\`\${styles.tabBtn} \${activeTab === 'entity' ? styles.activeTab : ''}\`}
                  onClick={() => setActiveTab('entity')}
                >
                  Entity & KYC ({checklist.filter(i => i.category === 'entity').length})
                </button>
                <button 
                  className={\`\${styles.tabBtn} \${activeTab === 'project' ? styles.activeTab : ''}\`}
                  onClick={() => setActiveTab('project')}
                >
                  Technical & Permits ({checklist.filter(i => i.category === 'project').length})
                </button>
                <button 
                  className={\`\${styles.tabBtn} \${activeTab === 'financial' ? styles.activeTab : ''}\`}
                  onClick={() => setActiveTab('financial')}
                >
                  Financial & Legal ({checklist.filter(i => i.category === 'financial').length})
                </button>
              </div>

              <div className={userRole === 'principal' && !principalSession ? styles.blurredContainer : ''}>
                ${blurOverlayContent}
                <div className={\`\${styles.checklistGrid} \${userRole === 'principal' && !principalSession ? styles.blurredGrid : ''}\`} style={{ marginTop: '30px' }}>
                  {filteredChecklist.map((item) => (
                    ${checklistItemContent}
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
`;

const newCode = code.substring(0, mainContainerIndex) + replacementJSX;

fs.writeFileSync('src/app/onboarding/page.js', newCode);
console.log('Successfully rewrote src/app/onboarding/page.js');
