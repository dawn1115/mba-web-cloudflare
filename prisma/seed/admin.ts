import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const storageRoot = path.join(process.cwd(), 'storage', 'uploads', 'seed', '2026-03');

async function ensureSeedFile(fileName: string, content: string) {
  await mkdir(storageRoot, { recursive: true });
  const absolutePath = path.join(storageRoot, fileName);
  await writeFile(absolutePath, content, 'utf8');
  return path.join('seed', '2026-03', fileName);
}

async function main() {
  const defaultPassword = await bcrypt.hash('Pass1234', 10);

  await prisma.downloadRecord.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.case.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.upsert({
      where: { email: 'admin@ahnu.edu.cn' },
      update: {
      name: '平台管理员',
      phone: '13800000000',
      role: 'admin',
      major: 'MBA 教育中心',
      password: defaultPassword,
    },
      create: {
      email: 'admin@ahnu.edu.cn',
      name: '平台管理员',
      phone: '13800000000',
      role: 'admin',
      major: 'MBA 教育中心',
      password: defaultPassword,
    },
  });

  const proUser = await prisma.user.upsert({
      where: { email: 'pro@ahnu.edu.cn' },
      update: {
        name: '案例开发专员',
        phone: '13800000001',
        role: 'pro',
        major: '战略管理',
        password: defaultPassword,
      },
      create: {
      email: 'pro@ahnu.edu.cn',
      name: '案例开发专员',
      phone: '13800000001',
      role: 'pro',
      major: '战略管理',
      password: defaultPassword,
    },
  });

  const teacher = await prisma.user.upsert({
      where: { email: 'teacher@ahnu.edu.cn' },
      update: {
        name: '张教授',
        phone: '13800000002',
        role: 'teacher',
        major: '经济管理学院',
        password: defaultPassword,
      },
      create: {
      email: 'teacher@ahnu.edu.cn',
      name: '张教授',
      phone: '13800000002',
      role: 'teacher',
      major: '经济管理学院',
      password: defaultPassword,
    },
  });

  const student = await prisma.user.upsert({
      where: { email: 'student@ahnu.edu.cn' },
      update: {
        name: '李同学',
        phone: '13800000003',
        role: 'student',
        major: '市场营销',
        password: defaultPassword,
      },
      create: {
      email: 'student@ahnu.edu.cn',
      name: '李同学',
      phone: '13800000003',
      role: 'student',
      major: '市场营销',
      password: defaultPassword,
    },
  });

  const pendingUser = await prisma.user.upsert({
      where: { email: 'pending@ahnu.edu.cn' },
      update: {
        name: '待审注册用户',
        phone: '13800000004',
        role: 'normal',
        password: defaultPassword,
      },
      create: {
      email: 'pending@ahnu.edu.cn',
      name: '待审注册用户',
      phone: '13800000004',
      role: 'normal',
      password: defaultPassword,
    },
  });

  const railwayFile = await ensureSeedFile(
    'china-railway-case-outline.pdf',
    '中铁四局集团有限公司案例正文示例。该文件用于本地演示案例下载、附件管理与统计记录流程。',
  );
  const railwayNote = await ensureSeedFile(
    'china-railway-teaching-note.pdf',
    '中铁四局教学指引示例。建议用于人力资源管理课程课堂讨论。',
  );
  const sansquirrelFile = await ensureSeedFile(
    'three-squirrels-case-outline.pdf',
    '三只松鼠案例正文示例。用于验证公开案例列表、详情和下载权限。',
  );

  await prisma.case.upsert({
    where: { serialNumber: 'AHNU-MBA-2026-0001' },
    update: {
      title: '中铁四局集团有限公司：“五共”管理模式探索新生代建筑工人培养',
      translatedTitle: 'China Railway No.4 Engineering Group Co., Ltd: Pioneering the “Five Shared” Management Model for the New Generation of Construction Workers',
      author: '王成园;高伟;罗彪;梁樑;冯善恒;范敏',
      authorDepartment: '合肥工业大学',
      abstract: '以农民工为代表的建筑工人是建筑企业的重要组成群体，是建筑业生产建造的直接实施者和价值创造者。中铁四局集团有限公司（简称“中铁四局”）作为一家与新中国一同成长的大型综合性建筑企业，长期以来坚持将农民工建筑工人队伍建设作为企业高质量发展的驱动要素，通过创新管理模式、健全保障机制、强化部门协同不断加强员工关系管理，持续推动产业工人队伍建设改革。案例首先回顾了中铁四局的发展历程，以及中铁四局面临时代变迁所带来的“用工荒”与新生代青年“从业难”问题，随后介绍了中铁四局如何通过推行“五共”管理，以建设高素质农民工队伍为抓手实现破局，最终助力企业和新生代农民工和谐共赢。通过案例学习，可以为学员和各类企业，尤其是国有企业的员工关系管理实践提供有益借鉴。',
      englishAbstract: 'Construction workers represented by migrant workers are a vital component of construction enterprises, serving as the direct implementers of production and construction activities and creators of value in the industry. China Railway No.4 Engineering Group Co., Ltd, a large-scale comprehensive construction enterprise that has grown alongside New China, has consistently regarded the development of migrant worker workforce as a driving factor for high-quality corporate growth. Through innovating management models, improving safeguard mechanisms, and strengthening departmental collaboration, the company has continuously enhanced employee relationship management, advancing reforms in the development of the industrial workforce. The case study first reviews the development history of China Railway No.4 Engineering Group Co., Ltd, and the challenges it faced amid changing times, including the “labor shortage” and the “employment difficulties”. It then introduces how China Railway No.4 Engineering Group Co., Ltd implemented the “Five Shared” Management approach, leveraging the cultivation of a high-quality migrant worker workforce as a key strategy to overcome these challenges, ultimately fostering harmonious and mutually beneficial outcomes for both the enterprise and migrant workers. Through this case study, learners and various enterprises, particularly state-owned ones, can gain valuable insights into employee relationship management practices.',
      keywords: '员工关系管理;中铁四局;国有企业;农民工;建筑工人;国企专项',
      englishKeywords: 'employee relations management; China Railway No.4 Engineering Group Co., Ltd; state-owned enterprises; migrant workers; construction workers',
      category: '建筑、建材业与房地产业',
      type: '决策型',
      course: '《人力资源管理》',
      company: '中铁四局集团有限公司',
      companyScale: '大型',
      functionalArea: '人力资源部门',
      language: '中文',
      pageCount: 14,
      targetAudience: '经营管理人员、本科生、硕士生、工商管理硕士（MBA）',
      writingMethod: '改编/二手资料编写',
      theoreticalKnowledge: '员工关系管理',
      developmentYear: 2024,
      accessLevel: 'public',
      copyrightStatement: '案例版权归安徽师范大学科技商学院管理案例库所有，仅用于教学与研究。',
      status: 'approved',
      uploaderId: proUser.id,
      reviewerId: admin.id,
      primaryFileName: '中铁四局案例正文.pdf',
      primaryFilePath: railwayFile,
      primaryFileMime: 'application/pdf',
      primaryFileSize: 114,
      downloads: 28,
      views: 186,
      publishedAt: new Date('2026-01-26T10:00:00Z'),
      reviewedAt: new Date('2026-01-26T09:30:00Z'),
      attachments: {
        create: [
          {
            kind: 'teaching_note',
            fileName: '中铁四局教学使用说明.pdf',
            filePath: railwayNote,
            mimeType: 'application/pdf',
            size: 85,
          },
        ],
      },
    },
    create: {
      serialNumber: 'AHNU-MBA-2026-0001',
      title: '中铁四局集团有限公司：“五共”管理模式探索新生代建筑工人培养',
      translatedTitle: 'China Railway No.4 Engineering Group Co., Ltd: Pioneering the “Five Shared” Management Model for the New Generation of Construction Workers',
      author: '王成园;高伟;罗彪;梁樑;冯善恒;范敏',
      authorDepartment: '合肥工业大学',
      abstract: '以农民工为代表的建筑工人是建筑企业的重要组成群体，是建筑业生产建造的直接实施者和价值创造者。中铁四局集团有限公司（简称“中铁四局”）作为一家与新中国一同成长的大型综合性建筑企业，长期以来坚持将农民工建筑工人队伍建设作为企业高质量发展的驱动要素，通过创新管理模式、健全保障机制、强化部门协同不断加强员工关系管理，持续推动产业工人队伍建设改革。案例首先回顾了中铁四局的发展历程，以及中铁四局面临时代变迁所带来的“用工荒”与新生代青年“从业难”问题，随后介绍了中铁四局如何通过推行“五共”管理，以建设高素质农民工队伍为抓手实现破局，最终助力企业和新生代农民工和谐共赢。通过案例学习，可以为学员和各类企业，尤其是国有企业的员工关系管理实践提供有益借鉴。',
      englishAbstract: 'Construction workers represented by migrant workers are a vital component of construction enterprises, serving as the direct implementers of production and construction activities and creators of value in the industry. China Railway No.4 Engineering Group Co., Ltd, a large-scale comprehensive construction enterprise that has grown alongside New China, has consistently regarded the development of migrant worker workforce as a driving factor for high-quality corporate growth. Through innovating management models, improving safeguard mechanisms, and strengthening departmental collaboration, the company has continuously enhanced employee relationship management, advancing reforms in the development of the industrial workforce. The case study first reviews the development history of China Railway No.4 Engineering Group Co., Ltd, and the challenges it faced amid changing times, including the “labor shortage” and the “employment difficulties”. It then introduces how China Railway No.4 Engineering Group Co., Ltd implemented the “Five Shared” Management approach, leveraging the cultivation of a high-quality migrant worker workforce as a key strategy to overcome these challenges, ultimately fostering harmonious and mutually beneficial outcomes for both the enterprise and migrant workers. Through this case study, learners and various enterprises, particularly state-owned ones, can gain valuable insights into employee relationship management practices.',
      keywords: '员工关系管理;中铁四局;国有企业;农民工;建筑工人;国企专项',
      englishKeywords: 'employee relations management; China Railway No.4 Engineering Group Co., Ltd; state-owned enterprises; migrant workers; construction workers',
      category: '建筑、建材业与房地产业',
      type: '决策型',
      course: '《人力资源管理》',
      company: '中铁四局集团有限公司',
      companyScale: '大型',
      functionalArea: '人力资源部门',
      language: '中文',
      pageCount: 14,
      targetAudience: '经营管理人员、本科生、硕士生、工商管理硕士（MBA）',
      writingMethod: '改编/二手资料编写',
      theoreticalKnowledge: '员工关系管理',
      developmentYear: 2024,
      accessLevel: 'public',
      copyrightStatement: '案例版权归安徽师范大学科技商学院管理案例库所有，仅用于教学与研究。',
      status: 'approved',
      uploaderId: proUser.id,
      reviewerId: admin.id,
      primaryFileName: '中铁四局案例正文.pdf',
      primaryFilePath: railwayFile,
      primaryFileMime: 'application/pdf',
      primaryFileSize: 114,
      downloads: 28,
      views: 186,
      publishedAt: new Date('2026-01-26T10:00:00Z'),
      reviewedAt: new Date('2026-01-26T09:30:00Z'),
      attachments: {
        create: [
          {
            kind: 'teaching_note',
            fileName: '中铁四局教学使用说明.pdf',
            filePath: railwayNote,
            mimeType: 'application/pdf',
            size: 85,
          },
        ],
      },
    },
  });

  await prisma.case.upsert({
    where: { serialNumber: 'AHNU-MBA-2026-0002' },
    update: {
      title: '三只松鼠：品牌心智与渠道升级',
      author: '案例开发专员',
      abstract:
        '围绕休闲食品品牌在流量见顶环境下的品牌运营与渠道重构展开分析，适用于市场营销课程。',
      keywords: '三只松鼠,品牌营销,渠道变革,电商',
      category: '市场营销',
      type: '分析型案例',
      course: '市场营销',
      company: '三只松鼠',
      developmentYear: 2025,
      accessLevel: 'campus',
      copyrightStatement: '限校内教学场景使用，未经授权不得向外传播。',
      status: 'approved',
      uploaderId: proUser.id,
      reviewerId: admin.id,
      primaryFileName: '三只松鼠案例正文.pdf',
      primaryFilePath: sansquirrelFile,
      primaryFileMime: 'application/pdf',
      primaryFileSize: 108, 
      downloads: 19,
      views: 132,
      publishedAt: new Date('2026-03-08T08:30:00Z'),
      reviewedAt: new Date('2026-03-08T08:00:00Z'),
    },
    create: {
      serialNumber: 'AHNU-MBA-2026-0002',
      title: '三只松鼠：品牌心智与渠道升级',
      author: '案例开发专员',
      abstract:
        '围绕休闲食品品牌在流量见顶环境下的品牌运营与渠道重构展开分析，适用于市场营销课程。',
      keywords: '三只松鼠,品牌营销,渠道变革,电商',
      category: '市场营销',
      type: '分析型案例',
      course: '市场营销',
      company: '三只松鼠',
      developmentYear: 2025,
      accessLevel: 'campus',
      copyrightStatement: '限校内教学场景使用，未经授权不得向外传播。',
      status: 'approved',
      uploaderId: proUser.id,
      reviewerId: admin.id,
      primaryFileName: '三只松鼠案例正文.pdf',
      primaryFilePath: sansquirrelFile,
      primaryFileMime: 'application/pdf',
      primaryFileSize: 108,
      downloads: 19,
      views: 132,
      publishedAt: new Date('2026-03-08T08:30:00Z'),
      reviewedAt: new Date('2026-03-08T08:00:00Z'),
    },
  });

  await prisma.case.upsert({
    where: { serialNumber: 'AHNU-MBA-2026-0003' },
    update: {
      title: '海螺水泥：绿色制造中的运营优化',
      author: '张教授',
      abstract: '待审核案例，展示上传后进入审核流的状态。',
      keywords: '海螺水泥,绿色制造,运营优化',
      category: '运营管理',
      type: '描述型案例',
      course: '运营管理',
      company: '海螺水泥',
      developmentYear: 2026,
      accessLevel: 'restricted',
      copyrightStatement: '案例作者已提交版权确认，待审核发布。',
      status: 'pending',
      uploaderId: proUser.id,
    },
    create: {
      serialNumber: 'AHNU-MBA-2026-0003',
      title: '海螺水泥：绿色制造中的运营优化',
      author: '张教授',
      abstract: '待审核案例，展示上传后进入审核流的状态。',
      keywords: '海螺水泥,绿色制造,运营优化',
      category: '运营管理',
      type: '描述型案例',
      course: '运营管理',
      company: '海螺水泥',
      developmentYear: 2026,
      accessLevel: 'restricted',
      copyrightStatement: '案例作者已提交版权确认，待审核发布。',
      status: 'pending',
      uploaderId: proUser.id,
    },
  });

  await prisma.case.upsert({
    where: { serialNumber: 'AHNU-MBA-2026-0004' },
    update: {
      title: '古井贡酒：多元化布局与品牌回归',
      author: '张教授',
      abstract: '已归档案例，用于演示归档后只读不可下载。',
      keywords: '古井贡酒,财务管理,品牌管理',
      category: '财务管理',
      type: '综合型案例',
      course: '公司金融',
      company: '古井贡酒',
      developmentYear: 2024,
      accessLevel: 'public',
      copyrightStatement: '归档案例，仅保留浏览记录。',
      status: 'archived',
      uploaderId: proUser.id,
      reviewerId: admin.id,
      archivedAt: new Date('2026-03-10T12:00:00Z'),
      reviewedAt: new Date('2026-03-02T08:00:00Z'),
      publishedAt: new Date('2025-12-20T10:00:00Z'),
    },
    create: {
      serialNumber: 'AHNU-MBA-2026-0004',
      title: '古井贡酒：多元化布局与品牌回归',
      author: '张教授',
      abstract: '已归档案例，用于演示归档后只读不可下载。',
      keywords: '古井贡酒,财务管理,品牌管理',
      category: '财务管理',
      type: '综合型案例',
      course: '公司金融',
      company: '古井贡酒',
      developmentYear: 2024,
      accessLevel: 'public',
      copyrightStatement: '归档案例，仅保留浏览记录。',
      status: 'archived',
      uploaderId: proUser.id,
      reviewerId: admin.id,
      archivedAt: new Date('2026-03-10T12:00:00Z'),
      reviewedAt: new Date('2026-03-02T08:00:00Z'),
      publishedAt: new Date('2025-12-20T10:00:00Z'),
    },
  });

  const caseOneId = (
    await prisma.case.findUniqueOrThrow({
      where: { serialNumber: 'AHNU-MBA-2026-0001' },
      select: { id: true },
    })
  ).id;

  const caseTwoId = (
    await prisma.case.findUniqueOrThrow({
      where: { serialNumber: 'AHNU-MBA-2026-0002' },
      select: { id: true },
    })
  ).id;

  const noticeCount = await prisma.notice.count();
  if (noticeCount === 0) {
    await prisma.notice.createMany({
      data: [
        {
          title: '2026 年春季案例征集启动',
          content:
            '本轮重点征集数字化转型、乡村振兴和绿色制造主题案例，截止日期为 2026 年 4 月 30 日。',
          authorId: admin.id,
        },
        {
          title: '审核标准更新通知',
          content:
            '新上传案例需补充版权声明和适用课程说明，未填写完整将退回修改。',
          authorId: admin.id,
        },
        {
          title: '系统维护提示',
          content: '平台将于 2026 年 3 月 28 日 22:00 进行例行维护，预计 30 分钟。',
          authorId: admin.id,
        },
      ],
    });
  }

  await prisma.collection.upsert({
    where: {
      userId_caseId: {
        userId: teacher.id,
        caseId: caseOneId,
      },
    },
    update: {},
    create: {
      userId: teacher.id,
      caseId: caseOneId,
    },
  });

  const existingDownloads = await prisma.downloadRecord.count();
  if (existingDownloads === 0) {
    await prisma.downloadRecord.createMany({
      data: [
        {
          userId: proUser.id,
          caseId: caseOneId,
        },
        {
          userId: proUser.id,
          caseId: caseTwoId,
        },
      ],
    });
  }

  const existingLogs = await prisma.activityLog.count();
  if (existingLogs === 0) {
    await prisma.activityLog.createMany({
      data: [
        {
          userId: admin.id,
          action: 'seed.init',
          entityType: 'system',
          detail: '初始化平台演示数据',
        },
        {
          userId: student.id,
          action: 'user.register',
          entityType: 'user',
          entityId: student.id,
          detail: '示例学生账号已激活',
        },
        {
          userId: pendingUser.id,
          action: 'user.register',
          entityType: 'user',
          entityId: pendingUser.id,
          detail: '待审核用户注册成功',
        },
      ],
    });
  }

  console.log('Seed completed. Demo accounts use password: Pass1234');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
