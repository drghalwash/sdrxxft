import blog from "../DB Models/Blog.js"
import Photo_Gallaries from "../DB Models/Photo_Gallary.js"

export const index = async (req, res) => {
    try {
        const { id } = req.params
        console.log(id)
        const Blog = await blog.findOne({ title: id }).lean();
         // Combine the titles and texts into the desired format
    const description = Blog.read_more_Titles.map((title, index) => ({
        title: title,
        text: Blog.read_more_Texts[index].replace(/\n/g, '<br>'),
    }));
    // Update the Blog object with the new description field
    Blog.description = description;

    // Get 2 random blogs with the same category
let randomBlogs = await blog.aggregate([
    { $match: { Category: Blog.Category, _id: { $ne: Blog._id } } }, // Match blogs in the same category, excluding the current blog
    { $sample: { size: 2 } } // Randomly select 2 blogs
]);

// If fewer than 2 blogs are found in the same category, get additional blogs from other categories
if (randomBlogs.length < 2) {
    const additionalBlogs = await blog.aggregate([
        { $match: { _id: { $ne: Blog._id }, Category: { $ne: Blog.Category } } }, // Exclude current blog and same category
        { $sample: { size: 2 - randomBlogs.length } } // Select the remaining blogs to make the total 2
    ]);

    // Combine the blogs from the same category and additional blogs
    randomBlogs = [...randomBlogs, ...additionalBlogs];
}
        const Photo_Gallary = await Photo_Gallaries.find({}).lean();

        // Fetch the latest 5 blogs, sorted by creation date
        const latestBlogs = await blog
            .find({})
            .sort({ createdAt: -1 }) // Sort by creation date in descending order
            .limit(5) // Limit the result to 5 blogs
            .lean();
        // Group blogs by category
        const blogs = await blog.find({}).lean();
        const groupedBlogs = blogs.reduce((acc, currentBlog) => {
            const { Category } = currentBlog;
            if (!acc[Category]) {
                acc[Category] = [];
            }
            acc[Category].push(currentBlog);
            return acc;
        }, {});

        res.render('Pages/Read_More', { Blog, Photo_Gallary,latestBlogs,groupedBlogs,randomBlogs })
    } catch (error) {
        console.error(error);
        res.status(500).render("Pages/404", { error });
    }
};


export const blog_back = async (req, res) => {
    try {
        const {id} = req.params;

        const blogs = await blog.find({Category: id}).lean();
        const All_Blogs = await blog.find({}).lean();
        const groupedBlogs = blogs.reduce((acc, currentBlog) => {
            const { Category } = currentBlog;
            if (!acc[Category]) {
                acc[Category] = [];
            }
            acc[Category].push(currentBlog);
            return acc;
        }, {});

        // Fetch the latest 5 blogs, sorted by creation date
        const latestBlogs = await blog
            .find({})
            .sort({ createdAt: -1 }) // Sort by creation date in descending order
            .limit(5) // Limit the result to 5 blogs
            .lean();


        const  Photo_Gallary= await Photo_Gallaries.find({}).lean();
        res.render('Pages/Blog', { groupedBlogs,Photo_Gallary,latestBlogs });
    } catch (error) {
        console.error(error);
        res.status(500).render("Pages/404", { error });
    }
};
