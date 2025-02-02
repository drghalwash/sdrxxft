import blog from "../DB Models/Blog.js";
import Photo_Gallaries from "../DB Models/Photo_Gallary.js"

export const index = async (req, res) => {
    try {
        // await blog.create({
        //     Category : "Education",
        //     image : "doctor.jpg",
        //     title : "Gynecomastia – Types And Treatments",
        //     description : "INTRODUCTION Men who suffer from gynecomastia may feel embarrassed about their bodies and alone in the struggle to fix it, but this endocrine disorder is actually more common than many people think. Although gynecomastia, also coined by the nomenclature “man…",
        //     read_more_image : "read-more-face.jpg",
        //     read_more_Titles : ["INTRODUCTION" , "CLASSIFICATIONS OF GYNECOMASTIA"],
        //     read_more_Texts : ["Men who suffer from gynecomastia may feel embarrassed about their bodies and alone in the struggle to fix it, but this endocrine disorder is actually more common than many people think.\nAlthough gynecomastia, also coined by the nomenclature “man boobs” can be caused by an endocrine disorder this is extremely rare and effects only the gland tissue.\n99% of the time it is mostly fat tissue in the chest area.\nIt is rarely due to hormonal changes unless through anti-cancer medications, hormones, steroids and excessive marijuana use.\nGynecomastia is a benign enlargement of breast tissue in males.\nMany males who suffer from this condition see the development and enlargement of breast tissue during adolescence due to maternal hormones and hormonal changes during puberty, but can affect men ages 18-50.\n\nAlthough the condition is brought out by hormonal changes within the body the condition is often associated with Klinefelter syndrome or the endocrine systems increased estrogen/androgen ratio which could have caused the development.\n Although physicians have been able to treat gynecomastia through medications it is rare and more often than not surgery is required to remove excessive tissue, liposuction fat and reshape the gland to create a more athletic appearance.\n\nGynecomastia is usually strictly defined as the visible or palpable development of breast tissue in men.\nThe term comes from the Greek words gyne meaning “woman” and mastos meaning “breast.”\nIn practical terms, this means abnormally large breasts on men.\nThis is often related to the occurrence of excess fat or, less frequently, overdeveloped muscles.\n\nThe condition is relatively common in adolescent boys, and 90% of the time symptoms disappear in a matter of months, or, as adolescence wanes, a few years later.\nBut the remaining 10% are burdened with a social handicap that causes a deep and complex shame, and often puts a man’s relationship with his body into an altered state.\n\nDrugs, medications, hormonal imbalance, genetic conditions, and exogenous hormones can all cause gynecomastia.\nDuring puberty it is normal for most boys to develop some proliferation of breast tissue.\nThis is often made known by the onset of pain in the nipples or sub-areolar region.\nOrdinarily this condition is self-limited and subsides within 6 to 18 months.\nWhen this gynecomastia persists, it is often embarrassing and psychologically debilitating."
        //         ,"Gynecomastia has been divided into four types:\n\nType I is known as pubertal or benign adolescent breast hypertrophy.\nThis refers to the quite common situation seen in pubertal males.\nIt usually presents between ages 10 to 14.\nThe incidence may be as high as 60-70%.\nIt is typically a firm, tender, subareolar mass anywhere from 1-5 cm in diameter.\nThese young men frequently complain of pain in the breasts to the touch or when wearing tight clothing.\nIt usually spontaneously resolves within 2 years or less.\n\nType II is the condition where there is natural gynecomastia without evidence of underlying disease, or with evidence of organic disease (including the use of certain drugs).\nThis type refers to a generalized, nonpainful breast enlargement.\nIn this type it is helpful to differentiate between naturally occurring gynecomastia versus breast enlargement due either to an abnormal (pathologic) process or to the use of certain drugs.\nCareful history taking regarding the time of onset, family history, duration of enlargement, history of systemic illness, weight change, and drug or medication use, is important.\nPhysical examination should include height, weight, blood pressure, breast size, and careful palpation of both breasts and genitals, in addition to a neurological assessment.\n\nType III gynecomastia is general obesity simulating gynecomastia or the occurrence of excess fat in and around the breast or chest area.\nThis is probably the most often seen type.\n\nType IV is hypertrophy of the underlying pectoral muscle.\n\nCLASSIFICATION OF CAUSES OF TYPE II GYNECOMASTIA\n\nI. Idiopathic (no known cause)\n\nII. Familial causes\na. Associated with anosmia (lack of smell) and testicular hypertrophy.\nb. Reifenstein’s syndrome (male pseudohermaphroditism secondary to partial androgen insensitivity).\nc. Associated with hypogonadism and small penis.\n\nIII. Specific illnesses or syndromes\na. Kleinfelter\nb. Male pseudohermaphroditism\nc. Testicular feminization syndrome\nd. Tumors\ne. Leukemia\nf. Hemophilia\ng. Leprosy\nh. Chronic glomerulonephritis\n\nIV. Miscellaneous drugs\na. amphetamines\nb. anabolic steroids\nc. birth control pills\nd. cimetidine\ne. diazepam\nf. corticosteroids\ng. digitalis\nh. estrogens\nj. human chorionic gonadotropin\nk. insulin\nl. isoniazid and other TB drugs\nm. ketoconazole\nn. marijuana\no. methadone and other narcotics\np. reserpine\nq. tricyclic antidepressants"
        //         ]
        // });


         
        // Fetch the latest 5 blogs, sorted by creation date
        const latestBlogs = await blog
            .find({})
            .sort({ createdAt: -1 }) // Sort by creation date in descending order
            .limit(5) // Limit the result to 5 blogs
            .lean();

        const blogs = await blog.find({}).lean();
        // Group blogs by category
        const groupedBlogs = blogs.reduce((acc, currentBlog) => {
            const { Category } = currentBlog;
            if (!acc[Category]) {
                acc[Category] = [];
            }
            acc[Category].push(currentBlog);
            return acc;
        }, {});

        const  Photo_Gallary= await Photo_Gallaries.find({}).lean();
        res.render('Pages/Blog', { groupedBlogs,Photo_Gallary,latestBlogs });
    } catch (error) {
        console.error(error);
        res.status(500).render("Pages/404", { error });
    }
};


