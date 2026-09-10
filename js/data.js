// ================================================================
// SUBJECT DATABASE
// ================================================================
const subjectDB = {
  "1stNew": {
    "CE": ["Chemistry", "Mathematics-I", "Engineering Physics", "Workshop Practice", "Manufacturing Process"],
    "CS": ["Chemistry", "Mathematics-I", "Engineering Physics", "Workshop Practice", "Manufacturing Process"],
    "EE": ["Chemistry", "Mathematics-I", "Engineering Physics", "Workshop Practice", "Manufacturing Process"],
    "ECE": ["Chemistry", "Mathematics-I", "Engineering Physics", "Workshop Practice", "Manufacturing Process"],
    "ME": ["Chemistry", "Mathematics-I", "Engineering Physics", "Workshop Practice", "Manufacturing Process"],
    "IOT": ["Chemistry", "Mathematics-I", "Engineering Physics", "Workshop Practice", "Manufacturing Process"]
  },
  "1stOld": {
    "CE":  ["Mathematics-I", "Physics", "Chemistry", "Basic Electrical", "Engineering Drawing"],
    "CS":  ["Mathematics-I", "Physics", "Chemistry", "Programming for Problem Solving", "Workshop Practice Manufacturing", "English"],
    "EE":  ["Mathematics-I", "Physics", "Chemistry", "Programming for problam solving", "Workshop Practice Manufacturing", "English"],
    "ECE": ["Mathematics-I", "Physics", "Chemistry", "Programming for problam solving", "Workshop Practice Manufacturing", "English"],
    "ME":  ["Mathematics-I", "Physics", "Chemistry", "Basic Electrical", "Engineering Drawing"],
    "IOT": ["Mathematics-I", "Physics", "Chemistry", "Basic Electrical", "Engineering Drawing"]
  },
  "2ndNew": {
    "CE": ["Mathematics-II", "Engineering Mechanics", "Basic Civil Engg", "Environmental Science", "Workshop"],
    "CS": ["Mathematics-II", "Engineering Mechanics", "Basic Civil Engg", "Environmental Science", "Workshop"],
    "EE": ["Mathematics-II", "Engineering Mechanics", "Basic Electrical", "Environmental Science", "Workshop"],
    "ECE": ["Mathematics-II", "Engineering Mechanics", "Basic Electronics", "Environmental Science", "Workshop"],
    "ME": ["Mathematics-II", "Engineering Mechanics", "Thermodynamics", "Environmental Science", "Workshop"],
    "IOT": ["Mathematics-II", "Engineering Mechanics", "IoT Fundamentals", "Environmental Science", "Workshop"]
  },
  "2ndOld": {
    "CE": ["Mathematics-II", "Engineering Mechanics", "Basic Civil", "EGD", "Workshop"],
    "CS": ["Mathematics-II", "Engineering Mechanics", "Basic Civil", "EGD", "Workshop"],
    "EE": ["Mathematics-II", "Engineering Mechanics", "BEE", "EGD", "Workshop"],
    "ECE": ["Mathematics-II", "Engineering Mechanics", "Basic Electronics", "EGD", "Workshop"],
    "ME": ["Mathematics-II", "Engineering Mechanics", "Thermodynamics", "EGD", "Workshop"],
    "IOT": ["Mathematics-II", "Engineering Mechanics", "IoT Basics", "EGD", "Workshop"]
  },
  "3rdNew": {
    "CE": ["Mathematics-III", "Mechanics of Solids", "Fluid Mechanics", "Surveying", "Building Materials"],
    "CS": ["Mathematics-III", "Data Structures", "Digital Logic", "Computer Org", "Discrete Maths"],
    "EE": ["Mathematics-III", "Network Theory", "EMF", "Electrical Machines-I", "Signals & Systems"],
    "ECE": ["Mathematics-III", "Network Theory", "EMF", "Analog Electronics", "Signals & Systems"],
    "ME": ["Mathematics-III", "Mechanics of Solids", "Thermodynamics", "Manufacturing", "Fluid Mechanics"],
    "IOT": ["Mathematics-III", "IoT Architecture", "Sensors", "Embedded C", "Data Structures"]
  },
  "3rdOld": {
    "CE": ["Mathematics-III", "Mechanics", "Fluid Mechanics", "Surveying", "Building Materials"],
    "CS": ["Mathematics-III", "Data Structures", "Digital Logic", "COA", "Discrete Maths"],
    "EE": ["Mathematics-III", "Network Theory", "EMF", "Electrical Machines", "Signals"],
    "ECE": ["Mathematics-III", "Network Theory", "Analog Electronics", "Signals", "EMF"],
    "ME": ["Mathematics-III", "Mechanics", "Thermodynamics", "Manufacturing", "Fluid"],
    "IOT": ["Mathematics-III", "IoT Arch", "Sensors", "Embedded", "Data Structures"]
  },
  "4th": {
    "CE": ["Mathematics-IV", "Structural Analysis", "Geotech Engg", "Hydrology", "Transportation"],
    "CS": ["Mathematics-IV", "Algorithm", "DBMS", "Operating Systems", "Computer Networks"],
    "EE": ["Mathematics-IV", "Power Systems", "Control Systems", "Electrical Machines-II", "Measurement"],
    "ECE": ["Mathematics-IV", "Digital Comm", "Control Systems", "VLSI", "Communication Systems"],
    "ME": ["Mathematics-IV", "Machine Design", "Thermal Engg", "Manufacturing-II", "Mechatronics"],
    "IOT": ["Mathematics-IV", "IoT Protocols", "Cloud Computing", "Data Analytics", "Embedded Systems"]
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
// ================================================================
const pdfDB = {
  "1stNew": {
    "CE": {
      "Chemistry": "",
      "Mathematics-I": "",
      "Engineering Physics": "",
      "Workshop Practice": "",
      "Manufacturing Process": ""
    },
    "CS": {
      "Chemistry": "",
      "Mathematics-I": "",
      "Engineering Physics": "",
      "Workshop Practice": "",
      "Manufacturing Process": ""
    },
    "EE": {
      "Chemistry": "",
      "Mathematics-I": "",
      "Engineering Physics": "",
      "Workshop Practice": "",
      "Manufacturing Process": ""
    },
    "ECE": {
      "Chemistry": "",
      "Mathematics-I": "",
      "Engineering Physics": "",
      "Workshop Practice": "",
      "Manufacturing Process": ""
    },
    "ME": {
      "Chemistry": "",
      "Mathematics-I": "",
      "Engineering Physics": "",
      "Workshop Practice": "",
      "Manufacturing Process": ""
    },
    "IOT": {
      "Chemistry": "",
      "Mathematics-I": "",
      "Engineering Physics": "",
      "Workshop Practice": "",
      "Manufacturing Process": ""
    }
  },
  "1stOld": {
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
    "ECE": {
      "Mathematics-I": "",
      "Physics": "",
      "Chemistry": "",
      "Basic Electrical": "",
      "Engineering Drawing": ""
    },
    "ME": {
      "Mathematics-I": "",
      "Physics": "",
      "Chemistry": "",
      "Basic Electrical": "",
      "Engineering Drawing": ""
    },
    "IOT": {
      "Mathematics-I": "",
      "Physics": "",
      "Chemistry": "",
      "Basic Electrical": "",
      "Engineering Drawing": ""
    }
  }
};