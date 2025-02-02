import HomeDB from "../DB Models/Home.js"
import OffersDB from "../DB Models/Offers.js"
import Photo_Gallaries from "../DB Models/Photo_Gallary.js"

export const index = async (req, res) => {
    try{
        //  await OffersDB.create({
        //     video_link: "https://www.youtube.com/embed/vB2pdb-I2EY?si=EPgiUseqjMCU0uTD",
        //     title: "Far far away, behind the word mountains",
        //     description: "Vokalia and Consonantia, there live the blind texts. Separated they live.",
        // }); 
        const  Get_Home= await HomeDB.find({}).lean();
        const  Offers= await OffersDB.find({}).lean();
        const Home = Get_Home[0]
        const  Photo_Gallary= await Photo_Gallaries.find({}).lean();
    res.render('Pages/index',{Home,Offers,Photo_Gallary})
} catch (error) {
    console.error(error);
    res.status(500).render("Pages/404", { error });
}
};
