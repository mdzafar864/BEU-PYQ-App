// ================================================================
// SUBJECT DATABASE
// ================================================================
const subjectDB = {
  "1st": {
    "CE":  ["Mathematics-I", "Physics", "Chemistry", "Basic Electrical", "Engineering Drawing"],
    "CS":  ["Mathematics-I", "Physics", "Chemistry", "Programming for Problem Solving", "Workshop Practice Manufacturing", "English"],
    "EE":  ["Mathematics-I", "Physics", "Chemistry", "Programming for problam solving", "Workshop Practice Manufacturing", "English"],
    "ECE": ["Mathematics-I", "Physics", "Chemistry", "Programming for problam solving", "Workshop Practice Manufacturing", "English"],
    "ME":  ["Mathematics-I", "Physics", "Chemistry", "Basic Electrical", "Engineering Drawing"],
    "IOT": ["Mathematics-I", "Physics", "Chemistry", "Basic Electrical", "Engineering Drawing"]
    
  },
  
  "2nd": {
    "CE": ["Mathematics-II", "Engineering Mechanics", "Basic Civil", "EGD", "Workshop"],
    "CS": ["Mathematics-II", "Engineering Mechanics", "Basic Civil", "EGD", "Workshop"],
    "EE": ["Mathematics-II", "Engineering Mechanics", "BEE", "EGD", "Workshop"],
    "ECE": ["Mathematics-II", "Engineering Mechanics", "Basic Electronics", "EGD", "Workshop"],
    "ME": ["Mathematics-II", "Engineering Mechanics", "Thermodynamics", "EGD", "Workshop"],
    "IOT": ["Mathematics-II", "Engineering Mechanics", "IoT Basics", "EGD", "Workshop"]
    
  },
  
  "3rd": {
    "CE": ["Mathematics-III", "Mechanics", "Fluid Mechanics", "Surveying", "Building Materials"],
    "CS": ["Mathematics-III", "Data Structures", "Digital Logic", "COA", "Discrete Maths"],
    "EE": ["Mathematics-III", "Network Theory", "EMF", "Electrical Machines", "Signals"],
    "ECE": ["Mathematics-III", "Network Theory", "Analog Electronics", "Signals", "EMF"],
    "ME": ["Mathematics-III", "Mechanics", "Thermodynamics", "Manufacturing", "Fluid"],
    "IOT": ["Mathematics-III", "IoT Arch", "Sensors", "Embedded", "Data Structures"]
  },
  
  "4th": {
    "CE": ["Transportation Engineering", "Building Planning and Drawing", "Geotechnical Engineering-1", "Hydraulic Engineering", "Structual Analysis", "Engineering Geology", "Societal & Global Impact"],
    "CS": ["Computer Orgnaization & Architecture", "Formal Language and Automate Theory", "Design and Analysis of Algorithms", "Database Management System", "Effective Technical Communication", "Computer Network"],
    "EE": ["Digital Electronics", "Signals & Systems", "Electrical Machines-II", "Electromagnatic Field Therory", "Control Systems", "Enviroment Science"],
    "ECE": ["Mathematics-IV", "Digital Comm", "Control Systems", "VLSI", "Communication Systems"],
    "ME": ["Applied Thermodynamics", "Fluid Machines", "Strength of Material", "Kinematics of Machine", "Project Management", "NPTEL-1"]
  },
  
  "5th": {
    "CE": ["Structural Design", "Foundation Engg", "Water Resources", "Environmental Engg", "Construction"],
    "CS": ["Theory of Computation", "Compiler Design", "Software Engg", "Computer Networks", "DBMS"],
    "EE": ["Power Electronics", "Renewable Energy", "Electrical Machines-III", "Protection", "Control"],
    "ECE": ["Microwave", "Optical Comm", "Digital Signal Proc", "VLSI Design", "Wireless Comm"],
    "ME": ["Heat Transfer", "Refrigeration", "Automobile", "Robotics", "Industrial Engg"],
    "IOT": ["IoT Security", "Big Data", "Cloud", "Machine Learning", "Advanced Embedded"]
  },
  
  "6th": {
    "CE": ["Design of Steel", "Concrete Design", "Hydraulic Engg", "Environmental-II", "Project"],
    "CS": ["AI", "Machine Learning", "Big Data", "Cloud Computing", "Cyber Security"],
    "EE": ["Power System-II", "High Voltage", "Smart Grid", "Electric Drives", "Renewable"],
    "ECE": ["Embedded Systems", "IoT", "Communication Nets", "Image Processing", "Antenna"],
    "ME": ["CAD/CAM", "Mechatronics", "Thermal-II", "Operations Research", "Project"],
    "IOT": ["IoT Analytics", "Edge Computing", "Wireless Sensors", "AI for IoT", "Project"]
  },
  
  "7th": {
    "CE": ["Project Management", "Earthquake Engg", "Transportation-II", "Elective", "Seminar"],
    "CS": ["Distributed Systems", "Deep Learning", "Blockchain", "Elective", "Seminar"],
    "EE": ["Power Plant", "Energy Audit", "Flexible AC", "Elective", "Seminar"],
    "ECE": ["Radar", "Satellite Comm", "Nanoelectronics", "Elective", "Seminar"],
    "ME": ["Energy Engg", "Tribology", "Production", "Elective", "Seminar"],
    "IOT": ["IoT in Smart Cities", "Industrial IoT", "Elective", "Seminar", "Project"]
  },
  
  "8th": {
    "CE": ["Project", "Elective-II", "Elective-III", "Seminar", "Internship"],
    "CS": ["Project", "Elective-II", "Elective-III", "Seminar", "Internship"],
    "EE": ["Project", "Elective-II", "Elective-III", "Seminar", "Internship"],
    "ECE": ["Project", "Elective-II", "Elective-III", "Seminar", "Internship"],
    "ME": ["Project", "Elective-II", "Elective-III", "Seminar", "Internship"],
    "IOT": ["Project", "Elective-II", "Elective-III", "Seminar", "Internship"]
  }
};

// ================================================================
// SUBJECT-WISE PDF LINKS DATABASE
const pdfDB = {
  "1st": {
    "CE": {
      "Mathematics-I": "",
      "Physics": "",
      "Chemistry": "",
      "Basic Electrical": "",
      "Engineering Drawing": ""
    },
    "CS": {
      "Mathematics-I": "",
      "Physics": "",
      "Chemistry": "",
      "Basic Electrical": "",
      "Engineering Drawing": ""
    },
    "EE": {
      "Mathematics-I": "https://drive.google.com/file/d/1JT4oVCzUF12Mr5ykoSXRiJULgocJoOKX/preview",
      "Workshop Practice Manufacturing": "https://drive.google.com/file/d/1BDCr0vZx8Bfa_MZgbUwDj6-eB-lGfIaQ/preview",
      "Chemistry": "https://drive.google.com/file/d/1wadC3d9024NoQ7KEkIJ3Y5TpB5CSnAAR/preview",
      "Programming for Problem Solving": "https://drive.google.com/file/d/1Bz_d_U5SuP4SvYoNGdAQQ7gUnEM-iQt2/preview",
      "English": "https://drive.google.com/file/d/1XKF4SRQYUEpFo2o_dq4NSBco8IqAaUx8/preview"
    },
    "ECE": {},
    "ME": {},
    "IOT": {}
  },

  "4th": {
    "CS": {
      "Computer Orgnaization & Architecture": "https://drive.google.com/file/d/1uFkDBpNlLVuo0Y-pp0Ikk_hir9yEQNfa/preview",
      "Formal Language and Automate Theory": "",
      "Design and Analysis of Algorithms": "https://drive.google.com/file/d/13OZ2sFva16vab0xrsz727YOlQnQyyZOw/preview",
      "Database Management System": "YOUR_GOOGLE_DRIVE_PREVIEW_LINK",
      "Effective Technical Communication": "https://drive.google.com/file/d/1PZ3QA9d2HyiaPpquCRQK-LRDG9-8wfJi/preview",
      "Computer Network": "https://drive.google.com/file/d/1GVeLU1pKyOqQjnp9vqN14eGM8omZzvTS/view?usp=drive_link"
    }
  }
};
