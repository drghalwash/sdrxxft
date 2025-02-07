// Centralized configuration for all categories and their groupings
const categoryConfig = {
  groups: {
    face: {
      title: "Face",
      titleStyle: "color: white; font-family: Verdana, sans-serif; font-weight: bold;",
      bgColor: "#1d2b4b",
      categories: [
        { id: "rhinoplasty", name: "Rhinoplasty" },
        { id: "facelift", name: "Facelift" },
        { id: "eyelidlift", name: "Eyelid Lift" }
      ]
    },
    breast: {
      title: "Breast",
      titleStyle: "color: white; font-family: Verdana, sans-serif; font-weight: bold;",
      bgColor: "#1d2b4b",
      categories: [
        { 
          id: "breastpsycho", 
          name: "Breast:Thinking all night",
          highlighted: true
        },
        { 
          id: "lollipoptechnique", 
          name: "Breast Reduction:Lollipop technique",
          highlighted: true
        },
        { 
          id: "miniinvasivebreast", 
          name: "Thinking about mini invasive",
          highlighted: true
        },
        { id: "breastaugmentation", name: "Breast Augmentation" }
      ]
    },
    body: {
      title: "Body",
      titleStyle: "color: white; font-family: Verdana, sans-serif; font-weight: bold;",
      bgColor: "#1d2b4b",
      categories: [
        { id: "bodycontouring", name: "Body Contouring" },
        { id: "fatgrafting", name: "Fat Grafting" },
        { id: "tummytuck", name: "Tummy Tuck (Abdominoplasty)" }
      ]
    }
  }
};

export default categoryConfig;
