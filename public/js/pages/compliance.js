export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container" style="max-width:800px;">
        <div style="margin-bottom:32px;">
          <h1 style="font-size:2rem;font-weight:800;margin-bottom:8px;">Compliance & Legal</h1>
          <p style="color:var(--text-secondary);">Our commitment to regulatory compliance and user protection</p>
        </div>

        <div class="card" style="padding:32px;line-height:1.8;">
          <h2 style="font-weight:600;margin:24px 0 12px;">Regulatory Framework</h2>
          <p>BITOP operates in compliance with applicable financial regulations including:</p>
          <ul style="margin-left:20px;margin-bottom:16px;">
            <li>Anti-Money Laundering (AML) directives</li>
            <li>Know Your Customer (KYC) requirements</li>
            <li>Counter-Terrorism Financing (CTF) regulations</li>
            <li>Data protection laws (GDPR, CCPA)</li>
            <li>Consumer protection regulations</li>
          </ul>

          <h2 style="font-weight:600;margin:24px 0 12px;">Licensing & Registration</h2>
          <p>BITOP is committed to obtaining appropriate licenses in jurisdictions where we operate. Current registrations:</p>
          <ul style="margin-left:20px;margin-bottom:16px;">
            <li>Financial Services Provider registration</li>
            <li>Virtual Asset Service Provider (VASP) registration where applicable</li>
            <li>Money Services Business registration in operating jurisdictions</li>
          </ul>

          <h2 style="font-weight:600;margin:24px 0 12px;">AML/KYC Program</h2>
          <p>Our comprehensive compliance program includes:</p>
          <ul style="margin-left:20px;margin-bottom:16px;">
            <li><strong>Customer Due Diligence (CDD):</strong> Identity verification for all users</li>
            <li><strong>Enhanced Due Diligence (EDD):</strong> For high-risk customers and large transactions</li>
            <li><strong>Ongoing Monitoring:</strong> Transaction screening, sanctions checks, PEP screening</li>
            <li><strong>Suspicious Activity Reporting (SAR):</strong> Automated and manual reporting to FIUs</li>
            <li><strong>Risk-Based Approach:</strong> Tiered verification based on activity and jurisdiction</li>
          </ul>

          <h2 style="font-weight:600;margin:24px 0 12px;">Sanctions Compliance</h2>
          <p>We screen all users and transactions against:</p>
          <ul style="margin-left:20px;margin-bottom:16px;">
            <li>OFAC Specially Designated Nationals (SDN) list</li>
            <li>UN Security Council sanctions lists</li>
            <li>EU Consolidated Sanctions List</li>
            <li>UK Sanctions List</li>
            <li>Other relevant jurisdictional lists</li>
          </ul>

          <h2 style="font-weight:600;margin:24px 0 12px;">Transaction Monitoring</h2>
          <p>Real-time monitoring for:</p>
          <ul style="margin-left:20px;margin-bottom:16px;">
            <li>Unusual transaction patterns</li>
            <li>Structuring/smurfing detection</li>
            <li>High-risk jurisdiction flows</li>
            <li>Mixing/tumbling service interactions</li>
            <li>Darknet market connections</li>
          </ul>

          <h2 style="font-weight:600;margin:24px 0 12px;">Data Protection</h2>
          <ul style="margin-left:20px;margin-bottom:16px;">
            <li>GDPR compliance with DPO appointment</li>
            <li>Data Processing Agreements with all vendors</li>
            <li>Privacy by design and default</li>
            <li>Data subject rights fulfillment</li>
            <li>Breach notification procedures</li>
          </ul>

          <h2 style="font-weight:600;margin:24px 0 12px;">Security Standards</h2>
          <ul style="margin-left:20px;margin-bottom:16px;">
            <li>SOC 2 Type II certification (in progress)</li>
            <li>ISO 27001 alignment</li>
            <li>PCI DSS compliance for payment processing</li>
            <li>Regular penetration testing</li>
            <li>Bug bounty program</li>
          </ul>

          <h2 style="font-weight:600;margin:24px 0 12px;">Restricted Jurisdictions</h2>
          <p>We do not provide services to residents of certain high-risk jurisdictions including but not limited to:</p>
          <ul style="margin-left:20px;margin-bottom:16px;">
            <li>North Korea, Iran, Syria, Cuba</li>
            <li>Crimea, Donetsk, Luhansk regions</li>
            <li>Other OFAC-sanctioned jurisdictions</li>
          </ul>

          <h2 style="font-weight:600;margin:24px 0 12px;">Reporting & Transparency</h2>
          <ul style="margin-left:20px;margin-bottom:16px;">
            <li>Annual transparency report</li>
            <li>Law enforcement request statistics</li>
            <li>SAR filing metrics (aggregated)</li>
            <li>Security incident disclosures</li>
          </ul>

          <h2 style="font-weight:600;margin:24px 0 12px;">Contact Compliance</h2>
          <p>For compliance inquiries, regulatory requests, or law enforcement contact:</p>
          <p>Email: compliance@bitop.com<br>PGP Key: Available on request</p>
        </div>
      </div>
    </div>
  `,

  init() {}
};