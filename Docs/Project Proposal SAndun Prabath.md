**Desing and Development of a Global Multidimensional Talent Marketplace and Casting Management System**

Research Project Proposal

Presented to the Faculty of Computing

NSBM Green University

In Partial fulfilment of requirement for the degree of

BSc in Software Engineering

By

SANDUN PRABATH Student Number:28607

December, 2025

1

### Table of Contents

| 1. Introduction………………………………………………………….3                                                                |
| ------------------------------------------------------------------------------------------------------ |
| 1.1. Background of the Study…………………………………...4-5                                                        |
| 1.2. Motivation………………………………………………….5-6                                                                 |
| 1.3. Study Objectives……………………………………………...7<br>2. Literature Review and Research Gap…………………………......8-9 |
| 2.1. Overview of Existing Studies…………………………….......8                                                   |
| 2.2. Identification of Research Gap……………………………….9                                                      |
| 3. Research Problem and Questions………………………………..9-10                                                    |
| 3.1. Main Research Problem…………………………………..9-10                                                          |
| 3.2. Specific Research Questions……………………………......10                                                    |
| 4. Research Strategy and Methodology…………………………..11-14                                                  |
| 4.1. Research Strategy…………………………………………...11                                                            |
| 4.2. Research Methodology Framework:The Peffers’ DSRM.11-12                                            |
| 4.3. Data Collection Methods…………………………………....12                                                        |
| 4.4. Data Preprocessing/ Preparation………………………...12-13                                                  |
| 4.5. Model Development / Implementation………………….12-13                                                   |
| 4.6. Evaluation………………………………………………..…14                                                                 |
| 4.7. Ethical Considerations……………………………………...14                                                         |
| 4.8. Limitations of the Study…………………………………….14                                                         |
| 5. Conclusion…………………………………………………………14                                                                  |
| 6. References……………………………………………………...15-16                                                              |

2

# **1. Introduction**

The rapid advancement of Information and Communication Technology (ICT) has significantly transformed professional sectors worldwide, particularly within the global creative and entertainment industries. Digital innovations such as online portfolios, real-time casting tools, and centralized talent databases have enhanced accessibility, streamlined recruitment processes, and improved professional engagement. In many developed regions, integrated digital platforms enable talents and recruiters to connect remotely, minimizing geographical barriers and time constraints.

However, in numerous contexts, the integration of specialized digital technologies within the fashion, film, and pageantry industries remains fragmented and heavily reliant on unverified social media interactions. This fragmented approach limits professional credibility, reduces efficiency in talent discovery, and increases the risk of miscommunication and fraud.

The modeling and entertainment sectors typically operate through a decentralized structure comprising established talent agencies and a growing population of independent freelance professionals. While agencies provide structured management and career development support, many freelance models struggle with professional visibility, secure bookings, and access to verified industry opportunities. Concurrently, industry stakeholders—including film directors, clothing brands, photographers, and pageant organizers—face challenges in identifying verified talent, reviewing comprehensive portfolios, and managing casting calls efficiently. These challenges stem largely from the absence of a unified, secure, and specialized digital platform that connects all industry stakeholders within a single global ecosystem.

This research therefore proposes the design and development of a **Global Multidimensional Talent Marketplace and Casting Management System** . The proposed platform aims to integrate three primary user categories—Models, Industry Professionals, and Pageant Hosts—into a centralized digital environment. Core features will include country-specific navigation, structured professional portfolio management, real-time job postings, verified talent profiles, and an automated application and casting workflow system.

From a software engineering perspective, this study applies system architecture design principles, secure software development practices, database optimization strategies, and usability evaluation techniques to address a real-world recruitment and talent management challenge. The system seeks to enhance transparency, improve efficiency, and foster global collaboration within the modeling and entertainment industries.

3

### **1.1. Background of the Study**

Professional visibility and efficient recruitment mechanisms are critical drivers in the growth and sustainability of the global fashion and entertainment industries. Despite their significant cultural and economic impact, many talented individuals continue to face barriers in accessing reliable, structured, and professionally verified opportunities.

Currently, a large proportion of agencies, production houses, and fashion organizations operate within independent and closed management systems. These systems often restrict access to curated internal databases, limiting exposure for freelance professionals. Consequently, many independent models and performers rely heavily on manual processes such as informal networking, physical auditions, personal referrals, and unstructured social media promotion to secure opportunities.

Existing digital solutions within this domain remain fragmented. Most platforms are either agencyspecific, geographically localized, or primarily based on social media groups that lack formal verification processes. Such systems do not provide comprehensive global coverage of talent and industry professionals across multiple countries. Furthermore, many available platforms lack integrated recruitment functionalities, including structured job advertisement modules, secure application tracking systems, and specialized tools tailored for pageant organizers—an increasingly significant segment of the modeling ecosystem.

As a result, recruiters frequently depend on informal recommendations, unverified online portfolios, and inconsistent communication channels when sourcing talent. This approach reduces operational efficiency, increases the risk of fraud or misrepresentation, and limits global accessibility.

The transition toward digital-first professional environments has further emphasized the necessity of remote recruitment capabilities. Contemporary production schedules, cross-border collaborations, and global branding strategies require directors, fashion brands, and event organizers to scout, evaluate, and book talent internationally without requiring physical presence. These evolving industry demands highlight the urgent need for a centralized, secure, and scalable online platform that supports three core industry pillars:

4

1. **Models** – Including editorial, commercial, and runway professionals with verified agency affiliation or freelance status.

2. **Industry Professionals** – Encompassing clothing brands, TV commercial (TVC) directors, film and drama directors, fashion show hosts, and modeling agencies.

3. **Pageant Hosts** – A specialized module designed for national and international pageant organizers, supporting structured contestant recruitment, digital submissions, and management workflows.

From a technological perspective, advancements in modern web and mobile application frameworks, cloud-based infrastructure, real-time databases, and secure authentication protocols provide the foundation for developing scalable and globally accessible talent marketplaces. Despite these technological capabilities, there remains limited research and practical implementation of a unified system that effectively bridges these three distinct stakeholder categories within a single integrated global ecosystem.

This study aims to address this gap by proposing the design and development of a Global Multidimensional Talent Marketplace and Casting Management System that integrates models, industry professionals, and pageant organizers into one secure, centralized digital platform. The proposed solution seeks to enhance transparency, improve recruitment efficiency, and promote international collaboration within the fashion and entertainment industries.

### **1.2. Motivation**

The motivation for this research arises from both industry-driven challenges and academic objectives.

From a social and professional perspective, many models encounter significant barriers, including limited access to verified job opportunities, payment insecurity, lack of contractual transparency, and restricted exposure to international recruiters. These challenges disproportionately affect freelance professionals and talent operating in regions where structured agency networks are underdeveloped. The absence of a trusted, centralized recruitment system increases vulnerability to exploitation and limits career progression.

5

A unified digital platform has the potential to reduce these barriers by providing verified recruiter access, structured application workflows, and global visibility regardless of geographical location. By integrating secure authentication mechanisms and transparent communication channels, such a system can enhance trust, professionalism, and accountability within the industry.

From an academic standpoint, this research presents an opportunity to apply core software engineering principles to a high-demand, real-world commercial problem. The proposed system requires comprehensive system analysis, multi-stakeholder requirement elicitation, and the design of a scalable architecture capable of supporting diverse user roles. It involves database modeling for heterogeneous data types (e.g., multimedia portfolios, structured job advertisements, application records), implementation of secure authentication and authorization mechanisms for both corporate and individual users, and integration of cloud-based infrastructure for global accessibility.

Furthermore, the project enables rigorous system evaluation through usability testing, performance assessment, and structured user feedback analysis. These processes align closely with the expected learning outcomes of a Software Engineering degree, particularly in areas such as requirements engineering, system architecture design, secure software development, and human–computer interaction.

In addition, the widespread adoption of smartphones, cloud services, and high-speed internet connectivity has created a favorable technological environment for implementing high-fidelity digital talent management solutions. This global digital readiness strengthens the feasibility and scalability of the proposed platform.

Overall, this research is motivated by the dual objective of contributing to the digital transformation of the global creative and entertainment industries while developing a practical, scalable, and user-centered software system that effectively serves models, industry professionals, and pageant organizers within a unified digital ecosystem.

6

### **1.3. Study Objectives**

#### **Primary Objective**

To design and develop a centralized, cross-platform talent marketplace and casting management system that enables talent selection by country and facilitates structured, professional interactions among models, industry professionals, and pageant organizers.

#### **Secondary Objectives**

- **Secure Multi-Role Authentication:**

  - To design and implement a secure registration, verification, and authentication system supporting multiple user roles, including models (freelance or agency-represented), industry professionals (brands, directors, agencies), and pageant organizers.

- **Comprehensive Profile Engineering:**

To develop an attribute-rich profile framework for models that includes personal details, categorized professional experience, high-resolution portfolio management, social media integration (Instagram and TikTok), and representation status.

- **Professional Recruitment Module:**

  - To implement a dedicated recruiter dashboard for industry professionals such as film and television commercial directors and fashion brands, enabling them to present verified credentials and publish active casting calls.

- **Specialized Pageant Hub:**

To design a dedicated module for pageant organizers that supports institutional profile management and the publication of official advertisements for new candidate recruitment (e.g., Miss/Mister Sri Lanka).

- **Global Navigation and Advanced Filtering:**

To develop a country-partitioned search and filtering system that allows recruiters to identify talent based on geographic location, physical attributes, and professional criteria.

- **System Evaluation:**

To evaluate the developed system in terms of usability across diverse user roles, performance efficiency when handling large-scale media content, and overall user satisfaction.

7

## **2. Literature Review and Research Gap**

### **2.1. Overview of Existing Studies**

Several academic studies have examined the impact of digital marketplaces on professional networking, emphasizing their effectiveness in minimizing geographical limitations and timerelated constraints for freelance professionals. Research on digital portfolio management systems indicates that centralized and verified professional data significantly enhances recruitment transparency and contributes to a measurable reduction in the “time-to-hire” metric within corporate and creative industries.

Within the domain of software engineering, contemporary research highlights the critical role of secure multi-role authentication mechanisms, scalable system architectures, and real-time communication modules in preserving trust, data integrity, and operational efficiency in professional digital ecosystems.

Despite these advancements, the creative and talent industries remain digitally underserved. Most existing platforms are highly fragmented, concentrating either on localized agency-based networks or generic social media environments that lack dedicated, professional casting and recruitment functionalities. Although social media platforms provide extensive visibility and outreach, they do not support structured, attribute-based data management essential for formal talent selection and verification processes.

Furthermore, a notable research gap exists in the comprehensive evaluation of backend system design for talent management platforms. A significant proportion of existing academic studies prioritize front-end UI/UX design considerations while offering limited analysis of the complex backend logic, role-based access control, and database partitioning required to effectively manage multiple interacting user roles—such as models, industry professionals (directors and brands), and pageant organizers—within a single, unified system.

Despite the proliferation of digital networking tools, there remains a significant lack of academic research focusing on the development of a unified platform that integrates models, diverse industry recruiters—including clothing brands, television commercial and film directors, and agencies—and pageant organizers within a single, country-partitioned system. Existing solutions often fail to adequately prioritize several critical functional and architectural areas, including structured data security, specialized recruitment and job-advertising mechanisms, and advanced global navigation and filtering logic required to support multi-role professional interactions at scale.

8

### **2.2. Identification of Research Gap**

Despite the proliferation of digital networking tools, there is a significant lack of academic research focusing on a unified platform that integrates models, diverse industry recruiters—including clothing brands, television commercial and film directors, and agencies—and pageant organizers within a single, country-partitioned system. Existing solutions often fail to prioritize the following critical areas:

- **Structured Data Security:**

  - Many existing platforms lack robust encryption mechanisms and fine-grained role-based access control, exposing sensitive professional portfolios and corporate casting data to potential security risks.

- **Specialized Recruitment and Job-Advertising Modules:** There is a notable absence of tailored tools designed to support industry-specific recruitment needs, such as pageant candidate searches or film and television casting calls, within an integrated digital marketplace.

- **Global Navigation and Filtering Logic:**

  - Limited research has addressed the design of systems that enable users to initially filter by country and subsequently navigate clearly defined industry domains—such as models, industry professionals, and pageant organizers—within a single platform.

This research addresses these gaps by proposing a multidimensional, centralized system tailored to the global creative industry, applying advanced system design principles to support secure, verified, and cross-border professional interactions.

## **3. Research Problem and Questions**

### **3.1. Main Research Problem**

The global fashion, film, and pageant industries currently lack a unified, secure, and multidimensional digital ecosystem for talent discovery and casting management. Although general-purpose social media platforms provide widespread visibility, they are inherently unsuitable for professional recruitment due to the absence of structured data models, verified credentials, and specialized casting and recruitment functionalities.

9

As a result, models face significant challenges in accessing legitimate global opportunities, while industry recruiters—including film and television directors, clothing brands, agencies, and pageant organizers—are required to navigate fragmented and largely unverified sources of information. This fragmentation leads to inefficiencies in talent identification, increased administrative workload, and prolonged recruitment cycles.

Furthermore, the absence of a trusted, centralized system creates a substantial “trust gap” between talent and recruiters, particularly in cross-border scouting scenarios where verification, data integrity, and professional accountability are critical. Addressing this problem requires the development of a secure, role-integrated digital platform capable of supporting verified, geographically scalable professional interactions within the global creative industry.

### **3.2. Specific Research Questions**

- **RQ1 (Requirements Analysis):**

What are the primary technical, operational, and professional barriers faced by models and recruiters when relying on unverified social media platforms and fragmented agency networks for global talent recruitment?

- **RQ2 (System Architecture):**

How can a centralized software architecture be designed with specialized, role-based modules to effectively support the distinct data workflows of models, industry professionals (directors and brands), and pageant organizers within a unified system?

- **RQ3 (Performance and Usability):**

How does the implementation of country-partitioned search logic and a media-optimized database architecture affect the efficiency of cross-border casting processes, particularly in terms of system latency and user task completion time?

- **RQ4 (Verification and Trust):**

To what extent can an integrated verification mechanism that differentiates agencyrepresented and freelance models reduce the risks associated with fraudulent casting calls and identity misrepresentation?

10

## **4. Research Strategy and Methodology**

### **4.1. Research Strategy**

This research adopts the Design Science Research (DSR) methodology. This approach is selected due to its strong emphasis on the systematic design, development, and evaluation of an information technology (IT) artifact intended to address a real-world organizational problem. The study follows iterative cycles of artifact construction and evaluation, allowing continuous refinement based on functional performance and user feedback. Through this process, the research ensures that the resulting software platform effectively satisfies the complex and high-fidelity requirements of the creative industry while conforming to established software engineering principles and quality standards **.**

### **4.2. Research Methodology Framework: The Peffers’ DSRM**

The study is structured around the six stages of the Peffers’ Design Science Research Methodology: _(Peffers, K., Tuunanen, T., Rothenberger, M. A., & Chatterjee, S,2007)._

#### 1. **Problem Identification:**

Conducting a comprehensive gap analysis of existing talent marketplaces and social media–based recruitment practices to identify deficiencies in meeting the professional requirements of the film, fashion, and pageant industries.

#### 2. **Definition of Objectives:**

Deriving both functional requirements—such as country-based talent selection and casting advertisement publishing—and non-functional requirements, including media streaming performance, system scalability, and data security, based on industry benchmarks and stakeholder needs.

#### 3. **Design and Development:**

Designing the overall system architecture, including the Entity–Relationship Diagram (ERD) to support multi-role interactions and the application programming interface (API) structure required for social media integration and secure data exchange (Lazaar, 2024).

11

#### 4. **Demonstration:**

Developing a high-fidelity prototype that enables users to select a country (e.g., Sri Lanka, United States, France) and interact with role-specific dashboards tailored to models, industry professionals, and pageant organizers.

#### 5. **Evaluation:**

Evaluating the prototype through rigorous usability and performance testing, including the application of the System Usability Scale (SUS) and system performance profiling to assess efficiency, responsiveness, and user satisfaction.

#### 6. **Communication:**

Documenting the system architecture, implementation process, technical challenges, and evaluation outcomes in the final thesis submission to communicate research contributions and practical implications.

### **4.3. Data Collection Methods**

Primary data will be collected through structured surveys and semi-structured interviews conducted with key stakeholders, including models, film and television commercial directors, and pageant organizers. These methods will be used to identify role-specific functional requirements, usability expectations, and industry challenges related to talent discovery and casting workflows.

Secondary data will be gathered from peer-reviewed software engineering journals, existing digital talent marketplace platforms, and industry benchmarks to inform system design decisions, architectural patterns, and performance standards.

### **4.4. Data Processing and Preparation**

The system will handle data from three main user types: Models, Industry Professionals, and Pageant Hosts. Data includes personal and professional details, portfolios (images/videos), event information, and verification documents.

12

Key steps:

1. Data Collection: User-submitted forms, file uploads, and API-based verification.

2. Data Cleaning: Validate mandatory fields, remove duplicates, standardize formats, and check file quality.

3. Data Transformation: Extract keywords, categorize profiles, generate thumbnails for media, and tag verified users.

4. Data Storage: Relational databases for structured data, cloud/object storage for media, with indexing for fast search.

5. Security: Encrypt data, implement multi-factor authentication, and enforce role-based access.

This process ensures accurate, organized, and secure data, enabling efficient talent discovery, recruitment, and event management across the platform.

### **4.5. Model Development and Implementation**

The proposed system will be implemented as a cross-platform application using modern software development frameworks to ensure accessibility, scalability, and performance across multiple devices. The core technical components of the system include:

- **Multi-Role Authentication:**

  - Implementation of distinct authentication and authorization workflows for different user roles, including models, industry professionals, and pageant organizers, supported by role-based access control mechanisms.

- **Media-Optimized Database:**

Development of a database architecture optimized for storing and streaming highresolution images and video content, enabling efficient management of professional portfolios and previous work samples.

- **Advertisement Engine:**

Design and implementation of a dedicated module that allows industry professionals and pageant organizers to publish casting calls or pageant advertisements, manage applications, and track candidate engagement in real time.

13

#### **4.6. Evaluation**

The developed system will be evaluated through a combination of usability testing, performance testing, and user satisfaction assessments. Usability evaluation will focus on the effectiveness and ease of completing role-specific tasks, while performance testing will specifically measure media loading times for high-resolution images and video content. Quantitative metrics, such as _task completion time_ —for example, the time required for a director to locate and initiate the booking of a model within a selected countrywill be analyzed to assess system efficiency and operational effectiveness.

#### **4.7. Ethical Considerations**

Ethical considerations will be a central component of this research. User privacy and the security of professional portfolios will be strictly maintained throughout the study. Informed consent will be obtained from all participants prior to data collection, and participation will be entirely voluntary. Sensitive personal and professional information, including contact details, will be protected through secure authentication mechanisms and encrypted communication protocols to prevent unauthorized access or data misuse.

#### **4.8. Limitations of the Study**

This study is limited to the development and evaluation of a prototype implementation and a defined sample of users from selected creative industry sectors. Due to time and resource constraints, the system will not undergo large-scale global deployment, and long-term performance evaluation across all countries and industry contexts may be limited. Consequently, findings related to scalability and sustained system usage may require further investigation in future research.

## **5. Conclusion**

<mark>By shifting the creative industry away from fragmented social media interactions and toward a verified, high-performance ecosystem, this project aims to increase professional safety and recruitment speed. The result is a robust digital artifact that serves as a blueprint for modern talent management.</mark>

14

## **6.** **<mark>References</mark>**

### **5.1 Methodology (Related to Section 4)**

<mark>Peffers, K., Tuunanen, T., Rothenberger, M. A., & Chatterjee, S. (2007).</mark>

_<mark>A design science research methodology for information systems research.</mark>_ **<mark>Journal</mark> of Management Information Systems** , 24(3), 45–77.

<mark>Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004).</mark>

_Design science in information systems research._ **MIS Quarterly** , 28(1), 75–105.

<mark>Lazaar, Y. (2024).</mark>

_<mark>Design science research methodology: Problem identification and solution design.</mark>_ Emergent Mind / Medium.

### **5.2 Talent Marketplace and Recruitment Trends (Related to Sections 1 & 2)**

<mark>Shapovalova, A., & Pavlov, V. (2021).</mark>

_Digitalization of recruitment: AI and talent management._

<mark>SkyQuest Technology. (2025).</mark>

_Global talent market size, share, and growth drivers forecast (2026–2033)._

<mark>Mercer. (2025).</mark>

_Guide to talent marketplaces: Unlocking skills and capacity._

15

### **5.3 Entertainment and Media Industry Research (Related to Sections 1 & 2)**

<mark>Dataintelo. (2024).</mark>

_Casting director platforms market research report 2033._

<mark>Research-Archive. (2025).</mark>

_Exploring the business models of artist management companies._

<mark>Panganiban, J., et al.</mark>

_Multi-user automated pageant tabulation and management systems._

### **5.4 Technical and Usability References (Related to Section 4)**

<mark>Davis, F. D. (1989).</mark>

_<mark>Perceived usefulness, perceived ease of use, and user acceptance of information</mark> technology._ **MIS Quarterly** , 13(3), 319–340.

<mark>Hosain, S., & Liu, P. (2020).</mark>

_The role of social media in modern recruitment: A usability perspective._

<mark>Bhatia, R. (2022).</mark>

_<mark>AI-driven recruitment: Enhancing efficiency and candidate experience.</mark>_ **International Journal of Human Resource Studies** .

16
