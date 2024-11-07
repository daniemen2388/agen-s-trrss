const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const languages = require("../src/config/language.json");

const CONTENT_ROOT = "src/content";
const BLOG_FOLDER = "blog";
const PUBLIC_DIR = "public";

// Ensure content is properly sanitized for JSON
const sanitizeContent = (content) => {
  return content.replace(/\n/g, " ").replace(/\r/g, "").replace(/\t/g, " ").trim();
};

// Get data from markdown files
const getData = () => {
  return languages
    .map((lang) => {
      const langFolder = lang.contentDir || lang.languageCode;
      const dir = path.join(CONTENT_ROOT, BLOG_FOLDER, langFolder);

      if (!fs.existsSync(dir)) {
        console.warn(`Warning: Directory ${dir} does not exist`);
        return [];
      }

      try {
        return fs
          .readdirSync(dir)
          .filter(
            (filename) =>
              !filename.startsWith("-") &&
              (filename.endsWith(".md") || filename.endsWith(".mdx"))
          )
          .map((filename) => {
            const filepath = path.join(dir, filename);
            const file = fs.readFileSync(filepath, "utf-8");
            const { data, content } = matter(file);
            
            // Skip draft posts
            if (data.draft) {
              return null;
            }

            // Generate slug
            const slug = filename.replace(/\.(md|mdx)$/, "");
            const fullSlug = `${BLOG_FOLDER}/${slug}`;

            return {
              lang: lang.languageCode,
              group: BLOG_FOLDER,
              slug: fullSlug,
              frontmatter: {
                title: data.title || "",
                description: data.description || "",
                categories: data.categories || [],
                tags: data.tags || [],
                ...data
              },
              content: sanitizeContent(content)
            };
          })
          .filter(Boolean); // Remove null entries (drafts)
      } catch (error) {
        console.error(`Error processing ${dir}:`, error);
        return [];
      }
    })
    .flat();
};

try {
  // Create public directory if it doesn't exist
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  // Generate search data
  const searchData = getData();
  
  // Write search.json to public directory
  const searchFilePath = path.join(PUBLIC_DIR, "search.json");
  fs.writeFileSync(searchFilePath, JSON.stringify(searchData, null, 2));
  
  console.log(`✓ Search index generated successfully at ${searchFilePath}`);
  console.log(`✓ Total entries: ${searchData.length}`);
} catch (error) {
  console.error("Error generating search index:", error);
  process.exit(1);
}