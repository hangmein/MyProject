require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Đang xóa dữ liệu cũ...');
  // Tên bảng trong Prisma bây giờ là số nhiều (Pages, Chapters, Comics)
  await prisma.pages.deleteMany();
  await prisma.chapters.deleteMany();
  await prisma.comics.deleteMany();

  console.log('🌱 Đang tạo dữ liệu mẫu...');

  const comicsData = [
    {
      Title: "Chainsaw Man",
      Slug: "chainsaw-man",
      Author: "Tatsuki Fujimoto",
      CoverImage: "https://images7.alphacoders.com/133/1339656.jpeg",
      Description: "Thợ săn quỷ với chiếc cưa máy.",
      Chapters: {
        create: [
          { ChapterNumber: 154, Title: "Breakout", Status: "DONE" },
          { ChapterNumber: 153, Title: "Chainsaw vs Mob", Status: "DONE" }
        ]
      }
    },
    {
      Title: "Oshi no Ko",
      Slug: "oshi-no-ko",
      Author: "Aka Akasaka",
      CoverImage: "https://images.alphacoders.com/131/1311795.jpeg",
      Description: "Câu chuyện về giới giải trí.",
      Chapters: {
        create: [
          { ChapterNumber: 120, Title: "Scandal", Status: "DONE" }
        ]
      }
    },
    {
      Title: "Blue Lock",
      Slug: "blue-lock",
      Author: "Muneyuki Kaneshiro",
      CoverImage: "https://images4.alphacoders.com/134/1342629.jpeg",
      Chapters: {
        create: [{ ChapterNumber: 240, Title: "Final Goal", Status: "DONE" }]
      }
    },
    {
      Title: "Solo Leveling",
      Slug: "solo-leveling",
      Author: "Chugong",
      CoverImage: "https://images8.alphacoders.com/134/1346513.jpeg",
      Chapters: {
        create: [{ ChapterNumber: 179, Title: "Epilogue", Status: "DONE" }]
      }
    }
  ];

  for (const comic of comicsData) {
    // Lưu ý: prisma.comics (số nhiều)
    await prisma.comics.create({ 
      data: {
        Title: comic.Title,
        Slug: comic.Slug,
        Author: comic.Author,
        CoverImage: comic.CoverImage,
        Description: comic.Description,
        Chapters: comic.Chapters
      }
    });
    console.log(`✅ Đã tạo: ${comic.Title}`);
  }

  console.log('🎉 Hoàn tất! Database đã có dữ liệu.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });