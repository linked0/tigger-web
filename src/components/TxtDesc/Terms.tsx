import React from "react";
import styled from "styled-components";
import Modal from "../Modal";

export const Description = styled.pre`
  padding: 0.5rem;
  letter-spacing: 0;
  font-weight: 400;
  color: ${({ theme }) => theme.grayTxt};
  font-size: 13px;
  font-family: "Roboto", sans-serif;
  overflow: auto;
  white-space: pre-wrap;
`;

export const Contents = styled.div`
  height: 400px;
  overflow-y: auto;
`;
export const Title = styled.h2`
  color: ${({ theme }) => theme.purple1};
  font-size: 18px;
  font-weight: 500;
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;
`;
interface InfoModal {
  isOpen: boolean;
  onDismiss: () => void;
}
export default function Terms({ isOpen, onDismiss }: InfoModal) {
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} minHeight={40} maxHeight={80}>
      <div>
        <Title>BOASwap Terms of Service</Title>
        <Contents>
          <Description>
            {`Updated date: July 28, 2022
            
Welcome to https://www.boaswap.io, a website-hosted user interface (the "Interface" or "App") provided by BOSAGORA.

The Interface provides access to a decentralized protocol on the BizNet blockchain that allows users to trade certain digital assets ("the BOASwap protocol" or the "Protocol").
The Interface is one, but not the exclusive, means of accessing the Protocol.


This Terms of Service Agreement (the "Agreement") explains the terms and conditions by which you may access and use the Interface. You must read this Agreement carefully. By accessing or using the Interface, you signify that you have read, understand, and agree to be bound by this Agreement in its entirety. If you do not agree, you are not authorized to access or use the Interface and should not use the Interface.


NOTICE: Please read this Agreement carefully as it governs your use of the Interface. This Agreement contains important information, including a binding arbitration provision and a class action waiver, both of which impact your rights as to how disputes are resolved. The Interface is only available to you — and you should only access the Interface — if you agree completely with these terms.


Modification of this Agreement

We reserve the right, in our sole discretion, to modify this Agreement from time to time. If we make any modifications, we will notify you by updating the date at the top of the Agreement and by maintaining a current version of the Agreement at https://www.boaswap.io. All modifications will be effective when they are posted, and your continued accessing or use of the Interface will serve as confirmation of your acceptance of those modifications. If you do not agree with any modifications to this Agreement, you must immediately stop accessing and using the Interface.


Eligibility

To access or use the Interface, you must be able to form a legally binding contract with us. Accordingly, you represent that you are at least the age of majority in your jurisdiction (e.g., eighteen years old) and have the full right, power, and authority to enter into and comply with the terms and conditions of this Agreement on behalf of yourself and any company or legal entity for which you may access or use the Interface.


You further represent that you are not (a) the subject of economic or trade sanctions administered or enforced by any governmental authority or otherwise designated on any list of prohibited or restricted parties (including but not limited to the list maintained by the Office of Foreign Assets Control of the U.S. Department of the Treasury). Finally, you represent that your access and use of the Interface will fully comply with all applicable laws and regulations, and that you will not access or use the Interface to conduct, promote, or otherwise facilitate any illegal activity.


Proprietary Rights

We own all intellectual property and other rights in the Interface and its contents, including (but not limited to) software, text, images, trademarks, service marks, copyrights, patents, and designs.
This intellectual property is available under the terms of our copyright licenses and our Trademark Guidelines.
Unlike the Interface, The BOASwap protocol is comprised entirely of open-source or source-available software running on the public BizNet blockchain.


Additional Rights

We reserve the following rights, which do not constitute obligations of ours: (a) with or without notice to you, to modify, substitute, eliminate or add to the Interface; (b) to review, modify, filter, disable, delete and remove any and all content and information from the Interface; and (c) to cooperate with any law enforcement, court or government investigation or order or third party requesting or directing that we disclose information or content or information that you provide.


Privacy

When you use the Interface, the only information we collect from you is your blockchain wallet address, completed transaction hashes, and the token names, symbols, or other blockchain identifiers of the tokens that you swap. We do not collect any personal information from you (e.g., your name or other identifiers that can be linked to you). We do, however, use third-party service providers, like Infura, Cloudflare, Amazon Web Services, and Google Analytics, which may receive or independently obtain your personal information from publicly-available sources. We do not control how these third parties handle your data and you should review their privacy policies to understand how they collect, use, and share your personal information. In particular, please visit https://policies.google.com/technologies/partner-sites to learn more about how Google uses data. By accessing and using the Interface, you understand and consent to our data practices and our service providers' treatment of your information.


We use the information we collect to detect, prevent, and mitigate financial crime and other illicit or harmful activities on the Interface. For these purposes, we may share the information we collect with blockchain analytics providers. We share information with these service providers only so that they can help us promote the safety, security, and integrity of the Interface. We do not retain the information we collect any longer than necessary for these purposes.


Please note that when you use the Interface, you are interacting with the blockchain, which provides transparency into your transactions. BOSAGORA does not control and is not responsible for any information you make public on the blockchain by taking actions through the Interface.


Prohibited Activity

You agree not to engage in, or attempt to engage in, any of the following categories of prohibited activity in relation to your access and use of the Interface:


Intellectual Property Infringement. Activity that infringes on or violates any copyright, trademark, service mark, patent, right of publicity, right of privacy, or other proprietary or intellectual property rights under the law.

Cyberattack. Activity that seeks to interfere with or compromise the integrity, security, or proper functioning of any computer, server, network, personal device, or other information technology system, including (but not limited to) the deployment of viruses and denial of service attacks.

Fraud and Misrepresentation. Activity that seeks to defraud us or any other person or entity, including (but not limited to) providing any false, inaccurate, or misleading information in order to unlawfully obtain the property of another.

Market Manipulation. Activity that violates any applicable law, rule, or regulation concerning the integrity of trading markets, including (but not limited to) the manipulative tactics commonly known as spoofing and wash trading.

Securities and Derivatives Violations. Activity that violates any applicable law, rule, or regulation concerning the trading of securities or derivatives.


Any Other Unlawful Conduct. Activity that violates any applicable law, rule, or regulation of Switzerland or another relevant jurisdiction, including (but not limited to) the restrictions and regulatory requirements imposed by Switzerland law.

Not Registered with the SEC or Any Other Agency

We are not registered with the U.S. Securities and Exchange Commission as a national securities exchange or in any other capacity. You understand and acknowledge that we do not broker trading orders on your behalf nor do we collect or earn fees from your trades on the Protocol. We also do not facilitate the execution or settlement of your trades, which occur entirely on the public distributed BizNet blockchain.


Non-Solicitation; No Investment Advice

You agree and understand that all trades you submit through the Interface are considered unsolicited, which means that you have not received any investment advice from us in connection with any trades and that we do not conduct a suitability review of any trades you submit.


All information provided by the Interface is for informational purposes only and should not be construed as investment advice. You should not take, or refrain from taking, any action based on any information contained in the Interface. We do not make any investment recommendations to you or opine on the merits of any investment transaction or opportunity. You alone are responsible for determining whether any investment, investment strategy or related transaction is appropriate for you based on your personal investment objectives, financial circumstances, and risk tolerance.


No Warranties

The Interface is provided on an "AS IS" and "AS AVAILABLE" basis. To the fullest extent permitted by law, we disclaim any representations and warranties of any kind, whether express, implied, or statutory, including (but not limited to) the warranties of merchantability and fitness for a particular purpose. You acknowledge and agree that your use of the Interface is at your own risk. We do not represent or warrant that access to the Interface will be continuous, uninterrupted, timely, or secure; that the information contained in the Interface will be accurate, reliable, complete, or current; or that the Interface will be free from errors, defects, viruses, or other harmful elements. No advice, information, or statement that we make should be treated as creating any warranty concerning the Interface. We do not endorse, guarantee, or assume responsibility for any advertisements, offers, or statements made by third parties concerning the Interface.


Non-Custodial and No Fiduciary Duties

The Interface is a purely non-custodial application, meaning you are solely responsible for the custody of the cryptographic private keys to the digital asset wallets you hold. This Agreement is not intended to, and does not, create or impose any fiduciary duties on us. To the fullest extent permitted by law, you acknowledge and agree that we owe no fiduciary duties or liabilities to you or any other party, and that to the extent any such duties or liabilities may exist at law or in equity, those duties and liabilities are hereby irrevocably disclaimed, waived, and eliminated. You further agree that the only duties and obligations that we owe you are those set out expressly in this Agreement.


Compliance Obligations

The Interface may not be available or appropriate for use in other jurisdictions. By accessing or using the Interface, you agree that you are solely and entirely responsible for compliance with all laws and regulations that may apply to you.


Assumption of Risk

By accessing and using the Interface, you represent that you are financially and technically sophisticated enough to understand the inherent risks associated with using cryptographic and blockchain-based systems, and that you have a working knowledge of the usage and intricacies of digital assets such as bitcoin (BTC), ether (ETH), bosagora (BOA), and other digital tokens such as those following the BizNet Token Standard (ERC-20). In particular, you understand that blockchain-based transactions are irreversible.


You further understand that the markets for these digital assets are highly volatile due to factors including (but not limited to) adoption, speculation, technology, security, and regulation. You acknowledge and accept that the cost and speed of transacting with cryptographic and blockchain-based systems such as BizNet are variable and may increase dramatically at any time. You further acknowledge and accept the risk that your digital assets may lose some or all of their value while they are supplied to the Protocol through the Interface, you may suffer loss due to the fluctuation of prices of tokens in a trading pair or liquidity pool, and, especially in expert modes, experience significant price slippage and cost. You understand that anyone can create a token, including fake versions of existing tokens and tokens that falsely claim to represent projects, and acknowledge and accept the risk that you may mistakenly trade those or other tokens. You further acknowledge that we are not responsible for any of these variables or risks, do not own or control the Protocol, and cannot be held liable for any resulting losses that you experience while accessing or using the Interface. Accordingly, you understand and agree to assume full responsibility for all of the risks of accessing and using the Interface to interact with the Protocol.


Third-Party Resources and Promotions

The Interface may contain references or links to third-party resources, including (but not limited to) information, materials, products, or services, that we do not own or control. In addition, third parties may offer promotions related to your access and use of the Interface. We do not endorse or assume any responsibility for any such resources or promotions. If you access any such resources or participate in any such promotions, you do so at your own risk, and you understand that this Agreement does not apply to your dealings or relationships with any third parties. You expressly relieve us of any and all liability arising from your use of any such resources or participation in any such promotions.


Release of Claims

You expressly agree that you assume all risks in connection with your access and use of the Interface and your interaction with the Protocol. You further expressly waive and release us from any and all liability, claims, causes of action, or damages arising from or in any way relating to your use of the Interface and your interaction with the Protocol. If you are a California resident, you waive the benefits and protections of California Civil Code § 1542, which provides: "[a] general release does not extend to claims that the creditor or releasing party does not know or suspect to exist in his or her favor at the time of executing the release and that, if known by him or her, would have materially affected his or her settlement with the debtor or released party."


Indemnity

You agree to hold harmless, release, defend, and indemnify us and our officers, directors, employees, contractors, agents, affiliates, and subsidiaries from and against all claims, damages, obligations, losses, liabilities, costs, and expenses arising from: (a) your access and use of the Interface; (b) your violation of any term or condition of this Agreement, the right of any third party, or any other applicable law, rule, or regulation; and (c) any other party's access and use of the Interface with your assistance or using any device or account that you own or control.


Limitation of Liability
IN NO EVENT WILL THE FOUNDATION, ITS AFFILIATES OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE, OR INABILITY TO USE, THE WEBSITES, ANY WEBSITES LINKED TO THEM, ANY CONTENT ON THE WEBSITES OR SUCH OTHER WEBSITES OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE WEBSITES OR SUCH OTHER WEBSITES, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO, PERSONAL INJURY, PAIN AND SUFFERING, EMOTIONAL DISTRESS, LOSS OF REVENUE, LOSS OF PROFITS, LOSS OF BUSINESS OR ANTICIPATED SAVINGS, LOSS OF USE, LOSS OF GOODWILL, LOSS OF DATA, AND WHETHER CAUSED BY TORT (INCLUDING NEGLIGENCE), BREACH OF CONTRACT OR OTHERWISE, EVEN IF FORESEEABLE. THE FOREGOING DOES NOT AFFECT ANY LIABILITY WHICH CANNOT BE EXCLUDED OR LIMITED UNDER APPLICABLE LAW WHICH MAY INCLUDE FRAUD.

Class Action and Jury Trial Waiver

You must bring any and all Disputes against us in your individual capacity and not as a plaintiff in or member of any purported class action, collective action, private attorney general action, or other representative proceeding. This provision applies to class arbitration. You and we both agree to waive the right to demand a trial by jury.


Governing Law and Jurisdiction

All matters relating to the Websites and these Terms of Use and any dispute or claim arising therefrom or related thereto (in each case, including non-contractual disputes or claims), shall be governed by and construed in accordance with the internal laws of Switzerland without giving effect to any choice or conflict of law provision or rule (whether of Switzerland or any other jurisdiction).
Any legal suit, action or proceeding arising out of, or related to, these Terms of Use or the Websites shall be instituted exclusively in Switzerland in the Kanton of Zug although we retain the right to bring any suit, action or proceeding against you for breach of these Terms of Use in your country of residence or any other relevant country. You waive any and all objections to the exercise of jurisdiction over you by such courts and to venue in such courts.


Entire Agreement

These terms constitute the entire agreement between you and us with respect to the subject matter hereof. This Agreement supersedes any and all prior or contemporaneous written and oral agreements, communications and other understandings (if any) relating to the subject matter of the terms.
`}
          </Description>
        </Contents>
      </div>
    </Modal>
  );
}
