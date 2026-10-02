### **DESIGN AND DEVELOPMENT OF A GLOBAL MULTIDIMENSIONAL TALENT MARKETPLACE AND CASTING MANAGEMENT SYSTEM FOR MODELS, INDUSTRY PROFESSIONALS, AND PAGEANT ORGANIZERS** 

By 

#### A.M.S.P Athapaththu 

Index No: 28607 

Interim Research Report 

Submitted In Partial Fulfillment of the requirements for the degree of 

Bachelor of Science (Honours) in Software Engineering 

Presented to the 

Faculty of Computing 

NSBM Green University- Sri Lanka 

June 2026 

1 

#### ABSTRACT 

The rapid evolution of Information and Communication Technology (ICT) has significantly transformed recruitment and talent management across many industries. While digital recruitment platforms have become increasingly common in corporate environments, the global fashion, entertainment, and pageantry industries continue to rely heavily on fragmented recruitment methods such as social media platforms, independent agencies, and informal professional networks. These approaches often lack profile verification, secure communication, centralized portfolio management, and efficient talent discovery mechanisms. 

This research proposes the design and development of a Global Multidimensional Talent Marketplace and Casting Management System that integrates models, industry professionals, and pageant organizers within a single digital ecosystem. The proposed platform provides secure multirole authentication, professional portfolio management, country-based talent discovery, centralized casting advertisements, recruiter dashboards, and pageant management modules. The system aims to improve transparency, efficiency, and trust while reducing the administrative challenges associated with international talent recruitment. 

The study adopts the Design Science Research (DSR) methodology to analyze stakeholder requirements, design the software architecture, develop a prototype, and evaluate system usability and performance. Primary data will be collected through interviews and questionnaires involving models, recruiters, and pageant organizers, while secondary data will be gathered from scholarly journals and industry reports. The expected outcome is a scalable software solution that improves recruitment workflows and supports global collaboration within the creative industry. 

2 

#### ACKNOWLEDGEMENT 

I would like to express my sincere gratitude to my research supervisor for providing valuable guidance, continuous encouragement, and constructive feedback throughout this research project. Their expertise and support have greatly contributed to the successful preparation of this proposal. 

I also extend my appreciation to the academic staff of the Faculty of Computing at NSBM Green University for providing the knowledge and resources necessary to undertake this research. 

Finally, I would like to thank my family and friends for their unwavering encouragement, patience, and support throughout my academic journey. 

3 

# **Table of Contents** 

### **Chapter 1: Introduction** 

|1.1 Chapter Overview       540//*(0|7|
|---|---|
|1.2 Background of the Study|7-8|
|1.3 Problem Statement||
|1.3.1 General Problem<br>|8|
|1.3.2 Specific Problems<br>|8-9|
|1.4 Research Questions<br>|9|
|1.5 Research Motivation|10|
|1.6 Research Aim<br>|10|
|1.7 Research Objectives||
|1.7.1 General Objective<br>|10|
|1.7.2 Specific Objectives<br>|10-11|
|1.8 Scope of the Study||
|1.8.1 In-Scope Areas|12|
|1.8.2 Out-of-Scope Areas|13|
|1.8.3 Geographic and Operational Scope<br>|13|
|1.9 Significance of the Study|13-15|
|1.10 Thesis Structure|15|
|1.11 Chapter Summary<br>|15-16|



4 

### **Chapter 2: Literature Review** 

|2.1 Introduction|17|
|---|---|
|2.2 Overview of Talent Marketplace Systems<br>|17|
|2.3 Casting and Talent Management Systems<br>|18|
|2.4 Digital Marketplaces<br>|19|
|2.5 Portfolio-Based Professional Systems<br>|19-20|
|2.6 Multi-role User Role Managemen|20-21|
|2.7 Recommendation and Matching Systems|21-22|
|2.8 Web-Based System Architecture|22|
|2.9 Technologies Used in Existing Systems|23|
|2.10 Comparative Analysis of Existing Systems<br>|24|
|2.11 Research Gap<br>|24-25|
|2.12 Conceptual Framework|25-26|
|2.13 Chapter Summary<br>|26|



5 

### **Chapter 3: Methodology** 

|3.1 Introduction<br>|27|
|---|---|
|3.2 Research Approach<br>|28|
|3.3 Software Development Life Cycle<br>|28-29|
|3.3.1 Requirement Analysis<br>|29-30|
|3.3.2 System Design<br>|30-31|
|3.3.3 System Implementation<br>|31-32|
|3.3.4 Testing Phase<br>|33|
|3.3.5 Deployment Phase<br>|34|
|3.3.6 Maintenance Phase<br>|35|
|3.4 Data Collection Method|35-36|
|3.5 Tools and Technologies Used<br>|36|
|3.6 Security Considerations|36-37|
|3.7 Assumptions and Constraints<br>|37|
|3.8 Chapter Summary|37|



<u>4.</u> **<u>References</u>** <u>38</u> 

6 

### **CHAPTER 1 – INTRODUCTION** 

#### **1.1 Chapter Overview** 

This chapter introduces the research by presenting the background of the study, identifying the research problem, defining the research aim and objectives, formulating the research questions, describing the scope and significance of the study, and outlining the overall thesis structure. It establishes the rationale for developing a centralized digital platform to support global talent recruitment within the fashion, entertainment, and pageantry industries. 

#### **1.2 Background of the Study** 

Information and Communication Technology (ICT) has changed the way organizations communicate, conduct business, and recruit employees. Today, digital platforms help employers connect with talented people from different parts of the world. Technologies such as cloud computing, mobile applications, artificial intelligence, and secure authentication have made recruitment faster, easier, and more efficient. 

The fashion and entertainment industries have grown rapidly over the past few years. Fashion shows, advertisements, films, digital content, modeling competitions, and beauty pageants create many job opportunities worldwide. As these industries continue to grow, there is a greater need for better recruitment systems. 

In the past, modeling agencies helped connect models with clients. They managed portfolios, negotiated contracts, and guided models in their careers. Today, many models work independently and use social media platforms like Instagram, TikTok, Facebook, and LinkedIn to promote themselves. Although these platforms provide good exposure, they are not designed for professional recruitment. Recruiters often find it difficult to verify profiles, check experience, and identify suitable candidates. 

The lack of a centralized recruitment platform creates many challenges. Models struggle to find genuine job opportunities. Recruiters must search through different websites and social media accounts to find suitable talent. Fake profiles, fraudulent casting calls, and poor communication also reduce trust in the recruitment process. 

7 

Industry professionals such as fashion brands, modeling agencies, photographers, film directors, commercial directors, and event organizers also face difficulties when searching for qualified talent. Most recruitment is still done through manual portfolio reviews, agency referrals, or social media. These methods are often slow and inefficient. 

Pageant organizers face similar problems. They need an organized system to manage applications, communicate with contestants, and conduct recruitment. However, many organizers still rely on emails, social media posts, and manual registration, which increases their workload. 

Existing platforms solve only some of these problems. LinkedIn mainly supports corporate recruitment, while Backstage and StarNow focus on specific areas of the entertainment industry. Most of these platforms do not provide one secure system that connects models, recruiters, and pageant organizers. They also lack advanced search, profile verification, and country-based talent discovery features. 

#### **1.3 Problem Statement** 

#### **1.3.1 General Problem** 

Despite advances in digital recruitment, the fashion, entertainment, and pageant industries still use outdated recruitment methods. Many people rely on social media, personal networks, and agencies to find talent. Existing platforms do not provide one secure system for models, recruiters, and pageant organizers to work together. They also lack verified profiles and organized recruitment features. As a result, recruitment takes more time, costs more money, and is less trustworthy. 

#### **1.3.2 Specific Problems** 

The research identifies the following specific problems based on findings from previous studies (Brown et al., 2021; Zhang et al., 2020; Ricci et al., 2015; Garcia, 2022): 

- Lack of a centralized platform that integrates models, industry professionals, and pageant organizers. 

- Heavy dependence on unverified social media platforms for recruitment. 

- Difficulty verifying professional experience and identity. 

8 

- Limited access to international recruitment opportunities for freelance models. 

- Time-consuming manual portfolio reviews and casting management. 

- Absence of dedicated pageant recruitment modules. 

- Inadequate role-based access control and secure authentication. 

- Limited country-specific search and filtering capabilities. 

- Challenges associated with managing large multimedia portfolios. 

- Insufficient communication tools for recruiters and talent. 

#### **1.4 Research Questions** 

Main Research Question 

How can a centralized global talent marketplace and casting management system improve recruitment efficiency, transparency, and trust within the fashion, entertainment, and pageantry industries? 

Specific Research Questions 

1. What technical and professional challenges do models, recruiters, and pageant organizers face when using existing recruitment methods? 

2. How can a secure multi-role software architecture improve interactions among different stakeholder groups? 

3. How can country-based talent discovery improve international recruitment? 

4. How can profile verification reduce fraudulent recruitment activities? 

5. How effective is the proposed system in terms of usability, performance, and user satisfaction? 

9 

#### **1.5 Research Motivation** 

The motivation for this research arises from the increasing demand for reliable digital recruitment solutions within the creative industry. Although digital technologies have transformed many business sectors, professional recruitment for models and pageant participants remains fragmented and dependent on informal networking. A secure, centralized platform can simplify recruitment, improve transparency, and create equal opportunities for freelance professionals while helping recruiters identify qualified candidates more efficiently. 

#### **1.6 Research Aim** 

The aim of this research is to design and develop a global talent marketplace and casting management system for models, aspiring talents, modeling agencies, photographers, pageant organizers, and other industry professionals. 

The proposed system will provide a single web-based platform where users can create profiles, manage portfolios, search for talent, and apply for or post casting opportunities. It will help reduce the problems of manual recruitment and scattered information while making communication and talent discovery easier. 

The system also aims to improve recruitment by providing secure user profiles, advanced search features, and organized casting management. Overall, it seeks to create a more efficient, transparent, and accessible platform for the global modeling and pageant industry. 

#### **1.7  Research Objectives** 

The objectives of this research are: 

#### **1.7.1 General Objectives** 

- To design and develop a scalable, secure, and user-friendly talent marketplace system for the global modeling and pageant industry. 

10 

#### **1.7.2 Specific Objectives** 

#### 1. To analyze existing systems and industry practices 

Investigate current casting platforms, agency workflows, and talent management tools to identify inefficiencies, limitations, and gaps in functionality. 

2. To identify system requirements 

Gather functional and non-functional requirements from key stakeholders such as models, agencies, photographers, and pageant organizers. 

3. To design the system architecture 

Develop a structured architecture that supports multi-role users, including modules for user management, casting management, talent portfolios, and communication systems. 

4. To develop a web-based platform 

Implement a functional system that allows users to register, create professional profiles, upload portfolios, and interact with casting opportunities. 

5. To implement advanced search and filtering mechanisms 

Enable industry professionals to search and filter talents based on attributes such as age, height, experience, location, category, and portfolio strength. 

6. To incorporate casting management functionalities 

Allow agencies and organizers to post casting calls, manage applications, shortlist candidates, and track selection processes. 

7. To ensure usability, accessibility, and scalability 

Design a system that is responsive, easy to use, and capable of supporting global users with minimal performance degradation. 

8. To evaluate system effectiveness 

Assess the system using user testing, feedback collection, and performance evaluation techniques. 

11 

#### **1.8 Scope of the Study** 

The scope of this study defines the boundaries within which the system is designed and implemented. 

#### **1.8.1 In-Scope Areas** 

- Development of a web-based global talent marketplace system. 

- Inclusion of multiple user roles: 

   - Models and aspiring talents 

   - Modeling agencies 

   - Photographers 

   - Pageant organizers 

   - Casting directors and industry professionals 

- User functionalities such as: 

   - Registration and authentication 

   - Profile creation and management 

   - Portfolio/image/video uploads 

   - Casting call creation and application submission 

   - Talent search and filtering system 

- Basic recommendation or matching logic based on profile attributes. 

- Messaging or communication features (optional depending on implementation level). 

- Admin panel for system moderation and management. 

12 

#### **1.8.2  Out-of-Scope Areas** 

The following features are not included in this research: 

- Full commercial deployment of the system. 

- Advanced AI features such as facial recognition or automatic talent scoring. 

- Online payment, financial transactions, or digital contract signing. 

- Legal identity verification or background checks. 

- Mobile application development (this may be considered in future work). 

#### **1.8.3  Geographic and Operational Scope** 

The system is designed for global usage, meaning it is not restricted to any specific country or region. However, the implementation and testing may be limited to a prototype or academic environment. 

#### **1.9  Significance of the Study** 

This research is significant in several key dimensions: 

#### **1.9.1 Industry Impact** 

The modeling and pageant industry often depends on social media, email, and physical auditions to recruit talent. These methods can be slow and unorganized. The proposed system provides one centralized platform to make casting and recruitment more efficient. 

13 

#### **1.9.2 Efficiency Improvement** 

The proposed system reduces: 

- Time spent searching for suitable talent 

- Manual communication between agencies and models 

- Dependency on physical auditions and location-based recruitment 

#### **1.9.3 Talent Visibility and Opportunities** 

Aspiring models and talents often find it difficult to get noticed. The proposed platform helps by: 

- Giving users global exposure 

- Providing direct access to casting opportunities 

- Allowing users to create organized and professional portfolios 

#### **1.9.4 Technological Contribution** 

This study contributes to the development of: 

- Digital marketplace systems. 

- Talent management platforms. 

- Web-based systems with multiple user roles. 

- Online casting and recruitment systems supported by databases. 

14 

#### **1.9.5 Academic Contribution** 

This research serves as a reference for future studies in: 

- Online recruitment systems 

- Industry-specific marketplace platforms 

- Scalable web application design 

#### **1.10  Thesis Structure** 

This thesis is organized into five main chapters: 

Chapter 1: Introduction 

This chapter introduces the research background, identifies the problem, and presents the aim, objectives, scope, and significance of the study. It provides an overview of the need for a global talent marketplace system in the modeling and pageant industry. 

Chapter 2: Literature Review 

This chapter reviews previous studies, existing systems, and technologies related to talent marketplaces, casting platforms, and digital recruitment. It also identifies the limitations of current systems and explains why a new solution is needed.. 

Chapter 3: System Analysis and Design 

This chapter presents the system analysis process, including requirement gathering, feasibility analysis, and system design. It includes architectural design, database design, UML diagrams, and module specifications. 

15 

#### Chapter 4: System Implementation and Evaluation 

This chapter describes the development process, technologies used, and implementation of system features. It also includes system testing, performance evaluation, and user feedback analysis. 

#### Chapter 5: Conclusion and Future Work 

This chapter summarizes the research findings, evaluates whether objectives were achieved, and provides recommendations for future enhancements such as AI integration, mobile applications, and advanced matchmaking systems. 

#### **1.11 Chapter Summary** 

#### Chapter 1 Summary 

This chapter introduced the research topic and established the foundation of the study. It outlined the problem statement, research aim, objectives, scope, and significance, highlighting the need for a global digital casting and talent marketplace system. 

#### Chapter 2 Summary 

This chapter reviewed existing literature and systems in the field of talent management and casting platforms. It identified gaps such as lack of global integration, inefficient search mechanisms, and limited role-based functionality. 

#### Chapter 3 Summary 

This chapter focused on system analysis and design. It detailed the architectural structure, database design, and module breakdown of the proposed system, ensuring it meets all functional and nonfunctional requirements. 

16 

### **CHAPTER 2: LITERATURE REVIEW** 

#### **2.1 Introduction** 

This chapter reviews existing literature related to talent marketplace systems, digital recruitment platforms, casting management systems, portfolio-based applications, recommendation systems, and web-based architectures. The review aims to examine current technologies, identify their strengths and limitations, and establish the research gap that motivates the development of the proposed Global Talent Marketplace and Casting Management System. 

The chapter also discusses modern technologies such as role-based access control, intelligent recommendation systems, cloud computing, and portfolio management that are relevant to the proposed system. By critically reviewing previous studies and existing platforms, this chapter provides the theoretical and technological foundation for the system design presented in later chapters. 

#### **2.2 Talent Marketplace Systems** 

Talent marketplace systems are digital platforms that connect individuals with organizations seeking specialized skills and professional services. These platforms enable users to create professional profiles, upload portfolios, search for opportunities, and communicate directly with recruiters. 

The rapid growth of digital technologies has significantly transformed recruitment processes. Traditional hiring methods relied heavily on physical applications, paper-based portfolios, and face-to-face interviews. Modern digital platforms have improved recruitment by reducing geographical barriers, increasing accessibility, and providing faster communication between employers and applicants. 

Research by Kumar and Lee (2020) suggests that successful digital talent marketplaces generally consist of three core components: user profile management, intelligent search capabilities, and communication mechanisms. Together, these components improve recruitment efficiency while expanding employment opportunities across international markets. 

Although these systems perform well in general recruitment, they rarely address the specialized requirements of the modeling, entertainment, and pageant industries. Professional modeling recruitment requires visual portfolio management, appearance-based filtering, verification processes, and structured casting workflows, which are generally absent from conventional employment platforms. 

17 

#### **2.3 Casting Management Systems in the Modeling Industry** 

Casting management systems are specialized recruitment platforms designed for selecting models, actors, performers, and contestants for fashion events, advertising campaigns, television productions, films, and beauty pageants. 

Traditional casting procedures continue to depend heavily on modeling agencies, manual portfolio reviews, and physical auditions (Nikolaou, I, 2021). While these approaches allow recruiters to evaluate candidates personally, they require considerable time, financial resources, and administrative effort. Furthermore, aspiring models without agency representation often struggle to gain exposure to recruiters. 

Several online platforms, including Model Mayhem and StarNow, provide digital portfolios and casting notices. These systems improve accessibility compared to traditional recruitment; however, they remain focused primarily on portfolio presentation rather than complete casting management. 

Critical evaluation of these platforms reveals several limitations: 

- Limited support for structured casting workflows. 

- Lack of standardized portfolio verification. 

- Insufficient search filters for physical characteristics and modeling categories. 

- Weak collaboration between recruiters, agencies, photographers, and event organizers. 

- Minimal automation during candidate selection. 

Consequently, recruiters frequently perform manual candidate comparisons, increasing recruitment time while reducing operational efficiency. 

18 

#### **2.4 Digital Marketplaces** 

Digital marketplace platforms such as LinkedIn, Fiverr, and Upwork have transformed professional networking and freelance employment by enabling individuals to market their skills globally. 

These platforms generally include user profile management, job posting, messaging systems, search functions, and reputation mechanisms. According to Lukac, M., & Grow, A. (2021), these components contribute significantly to digital workforce expansion by simplifying employeremployee interactions. 

Despite their success, these platforms are designed for general professional services rather than modeling recruitment. They lack industry-specific capabilities such as: 

- Digital casting management 

- Professional portfolio verification 

- Appearance-based talent searching 

- Beauty pageant management 

- Fashion event coordination 

Therefore, while existing digital marketplaces demonstrate the effectiveness of online recruitment, they cannot fully satisfy the operational requirements of modeling and pageant organizations. 

#### **2.5 Portfolio-Based Professional Systems** 

Digital portfolios have become essential tools for professionals working within creative industries. Unlike traditional résumés, portfolios provide visual evidence of an individual's skills, experience, achievements, and professional quality. 

Within the modeling industry, portfolios commonly include: 

- Professional photographs 

- Runway videos 

- Commercial advertisements 

19 

- Physical measurements 

- Awards and achievements 

- Previous modeling experience 

According to Geyik, S. C., Guo, Q., Hu, B., et al. (2018). digital portfolios improve recruiter decision-making by presenting comprehensive visual evidence that supports candidate evaluation. 

However, many existing portfolio platforms suffer from several weaknesses: 

- Lack of standardized portfolio structures. 

- Limited support for multimedia content. 

- Absence of identity verification. 

- Inconsistent presentation formats. 

- Difficulty comparing candidates objectively. 

These shortcomings reduce recruitment efficiency and increase the possibility of biased candidate selection. 

#### **2.6 Multi-Role User Management** 

Modern online platforms often serve multiple categories of users, each requiring different permissions and responsibilities. Role-Based Access Control (RBAC) is widely adopted to ensure users can only access functions relevant to their assigned roles (Sandhu, R., Coyne, E., Feinstein, H., & Youman, C,1996). 

The proposed system supports multiple stakeholders, including: 

- Models 

- Modeling agencies 

- Casting directors 

- Pageant organizers 

20 

- Photographers 

- Fashion designers 

- Administrators 

Each stakeholder performs distinct activities within the platform. For example, models manage portfolios, recruiters publish casting opportunities, photographers collaborate with talent, while administrators oversee system operations and verification processes. 

Implementing RBAC improves security, protects sensitive information, and enhances overall system organization. 

#### **2.7 Recommendation and  Matching Systems** 

Recommendation systems have become fundamental components of modern digital platforms by assisting users in identifying relevant products, services, or opportunities. 

Ricci et al. (2015) categorize recommendation techniques into: 

- Content-based filtering 

- Collaborative filtering 

- Hybrid recommendation 

Within talent marketplace platforms, recommendation systems can analyze multiple candidate characteristics, including: 

- Physical attributes 

- Professional experience 

- Skills 

- Portfolio quality 

- Geographic location 

- Previous work history 

Although recommendation algorithms have been widely adopted in e-commerce and entertainment platforms, their application within modeling recruitment remains relatively limited. Most existing 

21 

casting platforms continue to rely on manual searches performed by recruiters, resulting in longer recruitment cycles and inconsistent candidate matching. 

Integrating intelligent recommendation capabilities into casting management could significantly improve recruitment efficiency while providing fairer opportunities for emerging talent. 

#### **2.8 Web-Based System Architecture** 

Modern web applications typically follow layered client–server architectures that separate the presentation layer, business logic, and database management system. 

Pressman, R. S., & Maxim, B. R. (2020) argue that layered architectures improve maintainability, scalability, and software quality by separating application responsibilities. 

For global talent marketplace systems, scalable architectures are particularly important because they must support: 

- Large user populations 

- High-resolution image storage 

- Video portfolio management 

- Real-time messaging 

- Concurrent recruiter activities 

Cloud computing technologies further improve scalability by providing elastic storage and computing resources while reducing infrastructure costs. 

22 

#### **2.9 Technologies Used in Existing Platforms** 

Recent marketplace applications commonly employ modern web technologies to improve system performance and user experience. 

Typical technologies include: 

Frontend: 

- React.js 

- Angular 

- Vue.js 

Backend: 

- Node.js 

- Laravel 

- Django 

Databases: 

- MySQL 

- PostgreSQL 

- MongoDB 

Cloud Services: 

- AWS S3 

- Firebase Storage 

- Google Cloud Storage 

Pressman, R. S., & Maxim, B. R. (2020) note that these technologies support scalable full-stack application development and facilitate real-time communication, secure authentication, and efficient multimedia management. 

Nevertheless, technology alone does not guarantee suitability for specialized industries. Most existing implementations continue to target general-purpose recruitment rather than modeling and casting workflows. 

23 

#### **2.10 Comparative Analysis of Existing Systems** 

|Platform|Strengths|Limitations|
|---|---|---|
|LinkedIn|Professional networking, job<br>search|Not designed for modeling or casting|
|Model<br>Mayhem|Portfolio management, casting<br>notices|Limited workflow automation and<br>verification|
|StarNow|Talent discovery|Weak recommendation and filtering<br>capabilities|
|Fiverr|Global freelance marketplace|No casting or portfolio verification|
|Upwork|Secure freelance recruitment|Unsuitable for entertainment industry<br>recruitment|



The comparison indicates that although existing platforms successfully support professional networking and freelance recruitment, none provide an integrated environment combining talent management, portfolio verification, intelligent matching, casting workflows, and pageant management. 

#### **2.11 Research Gap** 

#### **The literature review identifies several significant research gaps.** 

First, no comprehensive global marketplace currently integrates models, agencies, photographers, pageant organizers, and casting directors within a single collaborative platform. 

Second, existing systems rarely provide structured casting workflow management from job publication to candidate selection and final recruitment. 

Third, intelligent recommendation and automated talent matching remain underutilized despite their potential to improve recruitment efficiency. 

Fourth, portfolio verification and standardized talent classification are insufficiently supported, making candidate evaluation inconsistent. 

24 

Finally, current platforms primarily address general recruitment and fail to satisfy the specialized operational requirements of the modeling, fashion, and pageant industries. 

These limitations justify the development of the proposed Global Talent Marketplace and Casting Management System. 

#### **2.12 Conceptual Framework** 

The proposed study adopts an Input, Process, Output (IPO) conceptual framework. Input 

- User profiles 

- Professional portfolios 

- Casting requirements 

- Recruiter preferences 

#### Process 

- User authentication 

- Portfolio management 

- Intelligent search 

- Recommendation and matching 

- Casting workflow management 

- Communication 

#### Output 

- Successful talent matching 

- Efficient casting decisions 

- Professional networking 

- Improved recruitment efficiency 

25 

The conceptual framework demonstrates how system inputs are transformed into meaningful recruitment outcomes through integrated digital processes. 

#### **2.13 Chapter Summary** 

This chapter critically reviewed existing literature on talent marketplace systems, casting management platforms, portfolio-based applications, recommendation systems, multi-role user management, and modern web technologies. The review showed that although existing platforms have significantly improved digital recruitment, they remain largely focused on general employment and freelance marketplaces. Current systems lack comprehensive casting workflows, intelligent talent matching, standardized portfolio verification, and integrated collaboration among industry stakeholders. 

The identified research gaps provide strong justification for developing the proposed Global Talent Marketplace and Casting Management System, which aims to integrate marketplace functionality, portfolio management, intelligent recommendations, and casting operations into a unified, scalable web platform. 

26 

###### 1. RESEARCH METHODOLOGY FRAMEWORK 

1. Problem Identification Identify issues in existing casting and talent management systems 

2. Literature Review 

Review of papers, books, articles, and existing platforms 

3. Requirement Gathering 

Observations, competitor analysis, interviews, user needs 

4. System Analysis 

Functional & non-functional requirements 

5. System Design 

UML Diagrams, ERD, Architecture, Database Design 

6. System Development 

Implementation using selected technologies 

7. Testing & Evaluation 

Unit Testing, Integration Testing, System Testing, UAT 

8. Deployment & Maintenance Deployment on cloud, feedback, updates and enhancements 

#### **3.2 Research Approach** 

This study adopts the **Design and Development Research (DDR)** methodology. Design and Development Research focuses on designing, developing, and evaluating technological solutions that address practical problems while contributing to knowledge within a specific domain. 

The selected research approach consists of the following stages: 

- Problem identification and analysis 

- Requirement gathering 

- System design 

- Prototype development 

- System implementation 

- Testing and evaluation 

- Deployment and maintenance 

The Design and Development Research methodology is appropriate because the objective of this study is to develop a functional web-based application that addresses the inefficiencies of existing casting and talent recruitment systems. 

#### **3.3 Software Development Methodology** 

The software was developed using the **Agile Software Development Methodology** , following an iterative and incremental development process. Agile was selected because it supports continuous improvement, frequent testing, user feedback, and flexible adaptation to changing requirements. 

Each development iteration consisted of planning, implementation, testing, review, and refinement. This enabled features to be developed independently while ensuring that feedback obtained during development could be incorporated into subsequent iterations. 

The Agile lifecycle adopted in this study consists of six major phases: 

- Requirement Analysis 

- System Design 

- System Implementation 

- Testing 

28 



<!-- Start of picture text -->
1. Requirements<br>2. DesignP Agile Principles=  Used:<br>* Customer Collaboration<br>* Responding to Change<br>6.FeedbackReview & AGILE 3 Working7 Software<br>CYCLE * Individuals & Interactions<br>: * Continuous Improvement<br>&, ;: * Iterative Development<br><!-- End of picture text -->

The non-functional requirements include: 

- Security 

- Performance 

- Scalability 

- Reliability 

- Availability 

- Usability 

- Maintainability 

The outputs of this phase served as the foundation for the subsequent system design. 

#### **3.3.2 System Design** 

Following requirement analysis, the overall architecture and database structure of the proposed system were designed using Object-Oriented Design (OOD) principles. 

Several software engineering models were developed to represent the system structure and behavior. 

The design artifacts include: 

- Use Case Diagram 

- Class Diagram 

- Entity Relationship Diagram (ERD) 

- Sequence Diagrams 

- Activity Diagrams 

- Database Schema 

- System Architecture Diagram 

The application adopts a **Three-Tier Architecture** , consisting of: 

30 



<!-- Start of picture text -->
PRESENTATION LAYER APPLICATION LAYER DATA LAYER<br>(Frontend) (Backend) (Database)<br>~ = -<br>fe Node.js /Express,js<br>rectis HTML / CSS / JS d © Monge<br>EEE RESTful.  API (Users,Data StorageProfiles,<br>User Business Logic Castings, Applications,<br>(Web Interface Authentication Messages, etc.)<br> Application) Authorization , J<br>t t<br>GRts Cloud Hosting<br>{Vercel / Render /AWS)<br><!-- End of picture text -->

#### **Frontend Technologies** 

- React.js 

- HTML5 

- CSS3 

- JavaScript 

- Bootstrap or Tailwind CSS 

The backend was developed using a RESTful architecture that handles business logic, authentication, and database communication. 

#### **Backend Technologies** 

- Node.js 

- Express.js 

The database stores structured information related to users, portfolios, casting calls, and applications. 

#### **Database** 

- MongoDB 

The major modules implemented include: 

- Authentication Module 

- User Management Module 

- Portfolio Management Module 

- Casting Management Module 

- Search and Filtering Module 

- Messaging Module 

- Administration Module 

32 

#### **3.3.4 Testing** 

Comprehensive testing was conducted throughout the development process to ensure that the software met the specified functional and non-functional requirements. 

The following testing techniques were performed: 

#### **Unit Testing** 

Individual modules such as authentication, portfolio management, and casting creation were tested independently. 

#### **Integration Testing** 

Interactions between the frontend, backend, and database components were verified to ensure proper communication. 

#### **System Testing** 

The complete integrated system was evaluated under realistic operating conditions to validate all functional requirements. 

#### **User Acceptance Testing (UAT)** 

Potential users, including models, recruiters, and administrators, evaluated the system to determine whether it met practical industry requirements. 

Testing focused on: 

- Functional correctness 

- Performance 

- Security 

- Usability 

- Reliability 

- Error handling 

Any defects identified during testing were corrected before deployment. 

33 

##### 9. TESTING PLAN 

|Test Case ID|Test Case Description|TestType|Expected Result|Actual Result|Status|
|---|---|---|---|---|---|
|TC-01|UserRegistration|Eonctiondl|Usershouldberegistered<br>successfully|Userregistered<br>successfully||
||.|,|Usershould login with|.||
|TC-03|CreateCastingCall<br>|Functional<br>|Casting callshould be<br>created<br>|Casting call created<br>||
|=<br>TC-04|r<br>ApplyforCasting|5<br>Functional|Application should be<br>submittedsuccessfully|—<br>r<br>Applicationsubmitted|Pas|
|TC-05|<br>Search&Filter|Functional|<br>Relevant resultsshould<br>be displayed|<br>Relevant results<br>displayed||
|TC-06|Messaging|Functional|Messageshouldbesent<br>and received|Messagesentand<br>received||
|TC-07|RoletBacodi Access|Security|Usercanaccessfeatures<br>based on role|Accessrestricted<br>correctly||
|TC-08|FileUpload|Functional|i'lmai<br>successfully|Fileuploaded||
|TC-09|SystemPerformance|Performance|cc monlplaiances<br>within acceptabletime|DaecENene<br>acceptable||
|TC-10|UserLogout|Functional|Usershould logout<br>successfully|Logoutsuccessful||



#### **3.3.6 Maintenance** 

Software maintenance ensures that the application remains secure, reliable, and compatible with future technological developments. 

Maintenance activities include: 

- Bug fixing 

- Performance optimization 

- Security updates 

- Database maintenance 

- Feature enhancements 

- Backup and recovery 

Regular maintenance improves long-term system sustainability. 

#### **3.4 Data Collection Methods** 

Information required for system development was collected using multiple techniques. 

#### **Literature Review** 

Previous studies, journal articles, conference papers, books, and existing software systems were reviewed to identify current technologies and research gaps. 

#### **Observation** 

Existing casting workflows within the modeling and entertainment industry were observed to understand current recruitment procedures. 

#### **Competitor Analysis** 

Existing platforms including LinkedIn, Model Mayhem, StarNow, Fiverr, and Upwork were analyzed to identify strengths and weaknesses. 

35 

#### **Informal Interviews** 

Informal discussions were conducted with potential users including aspiring models and recruiters to understand practical requirements. 

Using multiple data collection methods improved the reliability of the system requirements. 

#### **3.5 Tools and Technologies** 

The development environment consisted of modern full-stack technologies. 

|**Category**|**Technology**|
|---|---|
|Frontend|React.js, HTML5, CSS3, JavaScript|
|Backend|Node.js, Express.js|
|Database|MongoDB|
|IDE|Visual Studio Code|
|Version Control|Git and GitHub|
|API Testing|Postman|
|Database Tool|MongoDB Atlas|
|Deployment|Vercel, Render|



#### **3.6 Security Considerations** 

Security was incorporated throughout the software development process to protect user information and system resources. 

The implemented security mechanisms include: 

- Password hashing using bcrypt 

- JSON Web Token (JWT) authentication 

- Role-Based Access Control (RBAC) 

- Input validation 

- Secure file upload validation 

- HTTPS communication 

36 

- Session management 

- Protection against common web vulnerabilities such as SQL/NoSQL injection and CrossSite Scripting (XSS) 

These measures help ensure confidentiality, integrity, and availability of system data. 

#### **3.7 Assumptions and Constraints** 

#### **Assumptions** 

- Users have reliable Internet access. 

- Users possess basic web application skills. 

- Information provided by users is accurate. 

- Cloud services remain available throughout system operation. 

#### **Constraints** 

- Limited project development period. 

- Limited financial resources. 

- Prototype implementation rather than commercial deployment. 

- Limited availability of real-world industry datasets. 

- Evaluation conducted using a relatively small sample of users 

#### **3.8 Chapter Summary** 

This chapter presented the research methodology adopted for developing the Global Multidimensional Talent Marketplace and Casting Management System. It discussed the Design and Development Research approach, Agile software development methodology, requirement analysis, system design, implementation, testing, deployment, maintenance, data collection methods, security considerations, and development technologies. 

The structured methodology provides a systematic framework for producing a secure, scalable, and user-centered application while ensuring that the developed system effectively addresses the identified problems within the modeling and casting industry. 

37 

## **4. References** 

Geyik, S. C., Guo, Q., Hu, B., Ozcaglar, C., Thakkar, K., Wu, X., & Kenthapadi, K. (2018). Talent Search and Recommendation Systems at LinkedIn: Practical Challenges and Lessons Learned. arXiv. https://arxiv.org/abs/1809.06481 

Lukac, M., & Grow, A. (2021). Reputation systems and recruitment in online labor markets: Insights from an agent-based model. Journal of Computational Social Science, 4(1), 207–229. 

Nikolaou, I. (2021). Paving the way for research in recruitment and selection: Recent developments, challenges and future opportunities. European Journal of Work and Organizational Psychology, 30(2), 159–174. 

Pressman, R. S., & Maxim, B. R. (2020). Software Engineering: A Practitioner's Approach (9th ed.). McGraw-Hill. 

Ricci, F., Rokach, L., & Shapira, B. (Eds.). (2022). Recommender Systems Handbook (3rd ed.). Springer. 

Sandhu, R., Coyne, E., Feinstein, H., & Youman, C. (1996). Role-Based Access Control Models. IEEE Computer, 29(2), 38–47. 

Kokkodis, M., & Ransbotham, S. (2023). _Learning to Successfully Hire in Online Labor Markets_ . _Management Science_ . 

McDonnell, A., et al. (2024). _Talent Identification in Tripartite Work Arrangements in the Gig Economy_ . _Human Resource Management Review_ . 

Faulconbridge, J. R., Beaverstock, J. V., Hall, S., & Hewitson, A. (2009). _The 'War for Talent': The Gatekeeper Role of Executive Search Firms in Elite Labour Markets_ . _Geoforum_ , 40(5), 800–808. 

38 

