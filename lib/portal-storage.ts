export type AccountItem = {
  id: string;
  name: string;
  username: string;
  passwordHint: string;
  note: string;
};

export type TaskPriority = 'Cao' | 'Trung bình' | 'Thấp';
export type TaskStatus = 'Chưa làm' | 'Đang làm' | 'Hoàn thành';

export type TaskItem = {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  note: string;
  isPinned: boolean;
};

export type NoteItem = {
  id: string;
  text: string;
};

export type WorkLinkItem = {
  id: string;
  title: string;
  url: string;
  note: string;
  isPinned: boolean;
};

export type ReportStatus = 'Hoàn thành' | 'Đang xử lý' | 'Chờ duyệt';

export type ReportItem = {
  id: string;
  name: string;
  owner: string;
  updated: string;
  status: ReportStatus;
  note: string;
  isPinned: boolean;
};

export type EmployeeGroup =
  | 'CAP'
  | 'UP CAP'
  | 'UP CAP TRAINING'
  | 'UP TRAINING'
  | 'UP'
  | 'TRAINING'
  | 'SENIOR';

export type EmployeeWorkStatus = 'Đang làm việc' | 'Thử việc' | 'Tạm nghỉ';

export type EmployeeProfile = {
  id: string;
  name: string;
  email: string;
  employeeCode: string;
  group: EmployeeGroup;
  position: string;
  joinDate: string;
  workStatus: EmployeeWorkStatus;
  monthlyScore: string;
  badge: string;
  avatarUrl: string;
  note: string;
};

export type ShiftChecklistPriority = 'Rất cao' | 'Cao' | 'Trung bình';

export type ShiftChecklistItem = {
  id: string;
  taskLabel: string;
  title: string;
  attachmentName: string;
  attachmentUrl: string;
  priority: ShiftChecklistPriority;
};

export type ShiftChecklistGroup = {
  shiftCode: string;
  items: ShiftChecklistItem[];
};

export type DailyShiftAssignment = {
  date: string;
  memberId?: string;
  shiftCode: string;
  completedTaskIds: string[];
};

export type TeamScheduleMember = {
  id: string;
  order: number;
  name: string;
  title: string;
};

export type TeamScheduleRow = {
  memberId: string;
  dayCodes: string[];
};

export type TeamScheduleMonth = {
  month: string; // YYYY-MM
  rows: TeamScheduleRow[];
};

export type UserProfile = {
  displayName: string;
  email: string;
  role: string;
  timezone: string;
  language: string;
  theme: string;
  notifications: boolean;
  deadlineReminders: boolean;
  yubikeyPublicId: string;
  requireYubiKey: boolean;
  demoPassword: string;
  avatarUrl: string;

  employeeId: string;
  employeeCode: string;
  hrGroup: EmployeeGroup;
  hrPosition: string;
  joinDate: string;
  workStatus: EmployeeWorkStatus;
  monthlyScore: string;
  employeeBadge: string;
};

export type PortalData = {
  profile: UserProfile;
  accounts: AccountItem[];
  tasks: TaskItem[];
  notes: NoteItem[];
  workLinks: WorkLinkItem[];
  reports: ReportItem[];
  employees: EmployeeProfile[];
  shiftChecklists: ShiftChecklistGroup[];
  dailyShiftAssignments: DailyShiftAssignment[];
  teamScheduleMembers: TeamScheduleMember[];
  teamScheduleMonths: TeamScheduleMonth[];
};

const STORAGE_KEY = 'beer-portal-data';

const repeatCode = (code: string, count: number) =>
  Array.from({ length: count }, () => code);

const buildRow = (memberId: string, dayCodes: string[]): TeamScheduleRow => ({
  memberId,
  dayCodes,
});

const defaultTeamScheduleMembers: TeamScheduleMember[] = [
  { id: 'member-c-rot', order: 1, name: 'C Rot', title: 'CAP' },
  { id: 'member-t-mack', order: 2, name: 'T Mack', title: 'UP CAP Training' },
  { id: 'member-e-chen', order: 3, name: 'E Chen', title: 'UP SUP' },
  { id: 'member-z-zin', order: 4, name: 'Z Zin', title: 'UP SUP' },
  { id: 'member-k-beer', order: 5, name: 'K Beer', title: 'UP Training' },
  { id: 'member-d-one', order: 6, name: 'D One', title: 'UP Training' },
  { id: 'member-p-latt', order: 7, name: 'P Latt', title: 'UP SUP' },
];

const defaultTeamScheduleMonths: TeamScheduleMonth[] = [
  {
    month: '2026-04',
    rows: [
      buildRow('member-c-rot', [
        ...repeatCode('2', 7),
        ...repeatCode('6', 5),
        ...repeatCode('2', 8),
        ...repeatCode('6', 10),
      ]),
      buildRow('member-t-mack', [
        ...repeatCode('1', 12),
        'P',
        '5',
        ...repeatCode('1', 16),
      ]),
      buildRow('member-e-chen', [
        ...repeatCode('6', 10),
        'P',
        ...repeatCode('3', 19),
      ]),
      buildRow('member-z-zin', [
        ...repeatCode('1', 23),
        ...repeatCode('P', 4),
        ...repeatCode('1', 3),
      ]),
      buildRow('member-k-beer', [
        ...repeatCode('4', 10),
        ...repeatCode('6', 3),
        ...repeatCode('P', 3),
        ...repeatCode('1', 4),
        ...repeatCode('6', 10),
      ]),
      buildRow('member-d-one', [
        ...repeatCode('6', 7),
        ...repeatCode('P', 6),
        ...repeatCode('6', 7),
        ...repeatCode('4', 2),
        ...repeatCode('1', 8),
      ]),
      buildRow('member-p-latt', [
        ...repeatCode('NDH', 14),
        ...repeatCode('3', 3),
        ...repeatCode('2', 8),
        ...repeatCode('P', 5),
      ]),
    ],
  },
  {
    month: '2026-05',
    rows: [
      buildRow('member-c-rot', [
        ...repeatCode('2', 10),
        ...repeatCode('6', 10),
        ...repeatCode('2', 7),
        ...repeatCode('6', 4),
      ]),
      buildRow('member-t-mack', [...repeatCode('1', 31)]),
      buildRow('member-e-chen', [
        ...repeatCode('6', 10),
        ...repeatCode('P', 3),
        ...repeatCode('3', 18),
      ]),
      buildRow('member-z-zin', [
        ...repeatCode('1', 6),
        ...repeatCode('4', 7),
        ...repeatCode('1', 11),
        ...repeatCode('P', 3),
        ...repeatCode('1', 4),
      ]),
      buildRow('member-k-beer', [
        ...repeatCode('4', 6),
        ...repeatCode('P', 4),
        ...repeatCode('1', 10),
        ...repeatCode('6', 11),
      ]),
      buildRow('member-d-one', [
        ...repeatCode('1', 10),
        ...repeatCode('6', 10),
        ...repeatCode('P', 4),
        ...repeatCode('1', 7),
      ]),
      buildRow('member-p-latt', [
        '5',
        ...repeatCode('4', 9),
        ...repeatCode('1', 3),
        ...repeatCode('P', 7),
        ...repeatCode('2', 11),
      ]),
    ],
  },
];

const defaultData: PortalData = {
  profile: {
    displayName: 'Beer',
    email: 'kbeer@omachi.io',
    role: 'Administrator',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'Tiếng Việt',
    theme: 'Sáng',
    notifications: true,
    deadlineReminders: true,
    yubikeyPublicId: 'cccccbnkckjg',
    requireYubiKey: true,
    demoPassword: 'Beer@Portal_2026!YBK9',
    avatarUrl: '',

    employeeId: 'emp-k-beer',
    employeeCode: '10904242801',
    hrGroup: 'UP TRAINING',
    hrPosition: 'UP Training',
    joinDate: '2025-05-01',
    workStatus: 'Đang làm việc',
    monthlyScore: '95.4',
    employeeBadge: 'UP TRAINING • #1',
  },

  accounts: [
    {
      id: 'acc-1',
      name: 'Gmail cá nhân',
      username: 'beer.work@gmail.com',
      passwordHint: 'Mail chính',
      note: 'Nhận thông báo công việc',
    },
    {
      id: 'acc-2',
      name: 'Telegram',
      username: '@beer_admin',
      passwordHint: 'Chat work',
      note: 'Liên lạc nhanh',
    },
  ],

  tasks: [
    {
      id: 'task-1',
      title: 'Kiểm tra báo cáo đầu ngày',
      priority: 'Cao',
      status: 'Đang làm',
      dueDate: '2026-04-24',
      note: 'Ưu tiên xử lý buổi sáng',
      isPinned: true,
    },
    {
      id: 'task-2',
      title: 'Cập nhật dashboard số liệu',
      priority: 'Cao',
      status: 'Chưa làm',
      dueDate: '2026-04-25',
      note: '',
      isPinned: false,
    },
    {
      id: 'task-3',
      title: 'Chuẩn bị lịch họp ngày mai',
      priority: 'Trung bình',
      status: 'Hoàn thành',
      dueDate: '2026-04-26',
      note: '',
      isPinned: false,
    },
  ],

  notes: [
    { id: 'note-1', text: 'Deadline báo cáo tuần trước 17:00 thứ 6' },
    { id: 'note-2', text: 'Ưu tiên xử lý các việc liên quan số liệu' },
  ],

  workLinks: [
    {
      id: 'link-1',
      title: 'Dashboard chính',
      url: 'https://example.com/dashboard',
      note: 'Link mẫu để theo dõi số liệu',
      isPinned: true,
    },
  ],

  reports: [
    {
      id: 'rep-1',
      name: 'Báo cáo vận hành ngày',
      owner: 'Beer',
      updated: '09:15',
      status: 'Hoàn thành',
      note: 'Báo cáo quan trọng cần theo dõi',
      isPinned: true,
    },
    {
      id: 'rep-2',
      name: 'Báo cáo tiến độ công việc',
      owner: 'Beer',
      updated: '10:40',
      status: 'Đang xử lý',
      note: '',
      isPinned: false,
    },
  ],

  employees: [
    {
      id: 'emp-c-rot',
      name: 'C Rot',
      email: 'crot@omachi.io',
      employeeCode: '10423961681',
      group: 'CAP',
      position: 'CAP',
      joinDate: '2023-06-01',
      workStatus: 'Đang làm việc',
      monthlyScore: '100',
      badge: 'CAP • #1',
      avatarUrl: '',
      note: '',
    },
    {
      id: 'emp-t-mack',
      name: 'T Mack',
      email: 'tmack@omachi.io',
      employeeCode: '10922941498',
      group: 'UP CAP',
      position: 'UP CAP Training',
      joinDate: '2022-08-01',
      workStatus: 'Đang làm việc',
      monthlyScore: '',
      badge: '',
      avatarUrl: '',
      note: '',
    },
    {
      id: 'emp-e-chen',
      name: 'E Chen',
      email: 'echen@omachi.io',
      employeeCode: '12305231731',
      group: 'UP',
      position: 'UP',
      joinDate: '2024-02-01',
      workStatus: 'Đang làm việc',
      monthlyScore: '100',
      badge: 'UP • #1',
      avatarUrl: '',
      note: '',
    },
    {
      id: 'emp-z-zin',
      name: 'Z Zin',
      email: 'zzin@omachi.io',
      employeeCode: '12105243144',
      group: 'UP',
      position: 'UP',
      joinDate: '2024-09-01',
      workStatus: 'Đang làm việc',
      monthlyScore: '98',
      badge: 'UP • #2',
      avatarUrl: '',
      note: '',
    },
    {
      id: 'emp-k-beer',
      name: 'K Beer',
      email: 'kbeer@omachi.io',
      employeeCode: '10904242801',
      group: 'UP TRAINING',
      position: 'UP Training',
      joinDate: '2025-05-01',
      workStatus: 'Đang làm việc',
      monthlyScore: '95.4',
      badge: 'UP TRAINING • #1',
      avatarUrl: '',
      note: '',
    },
    {
      id: 'emp-d-one',
      name: 'D One',
      email: 'done@omachi.io',
      employeeCode: '10610242289',
      group: 'UP TRAINING',
      position: 'UP Training',
      joinDate: '2024-06-01',
      workStatus: 'Đang làm việc',
      monthlyScore: '',
      badge: '',
      avatarUrl: '',
      note: '',
    },
    {
      id: 'emp-z-jin',
      name: 'Z Jin',
      email: 'zjin@omachi.io',
      employeeCode: '1804242788',
      group: 'SENIOR',
      position: 'SENIOR',
      joinDate: '2023-05-01',
      workStatus: 'Đang làm việc',
      monthlyScore: '100',
      badge: 'SENIOR • #1',
      avatarUrl: '',
      note: '',
    },
    {
      id: 'emp-g-lyn',
      name: 'G Lyn',
      email: 'glyn@omachi.io',
      employeeCode: '20804242698',
      group: 'SENIOR',
      position: 'SENIOR',
      joinDate: '2024-01-01',
      workStatus: 'Đang làm việc',
      monthlyScore: '96.8',
      badge: 'SENIOR • #2',
      avatarUrl: '',
      note: '',
    },
    {
      id: 'emp-n-mei',
      name: 'N Mei',
      email: 'nmei@omachi.io',
      employeeCode: '2503242596',
      group: 'SENIOR',
      position: 'SENIOR',
      joinDate: '2023-04-01',
      workStatus: 'Đang làm việc',
      monthlyScore: '96.8',
      badge: 'SENIOR • #3',
      avatarUrl: '',
      note: '',
    },
    {
      id: 'emp-s-ly',
      name: 'S Ly',
      email: 'sly@omachi.io',
      employeeCode: '12910231992',
      group: 'SENIOR',
      position: 'SENIOR',
      joinDate: '2023-11-01',
      workStatus: 'Đang làm việc',
      monthlyScore: '90.9',
      badge: 'SENIOR • #4',
      avatarUrl: '',
      note: '',
    },
    {
      id: 'emp-k-rick',
      name: 'K Rick',
      email: 'krick@omachi.io',
      employeeCode: '11107243447',
      group: 'SENIOR',
      position: 'SENIOR',
      joinDate: '2022-12-01',
      workStatus: 'Đang làm việc',
      monthlyScore: '88.2',
      badge: 'SENIOR • #5',
      avatarUrl: '',
      note: '',
    },
  ],

  shiftChecklists: [
    {
      shiftCode: '1',
      items: [
        {
          id: 'ca1-task-1',
          taskLabel: 'Task 1',
          title: 'Điểm danh',
          attachmentName: 'Check - BC114103 - Điểm Danh Nhân Sự',
          attachmentUrl: '',
          priority: 'Cao',
        },
        {
          id: 'ca1-task-2',
          taskLabel: 'Task 2',
          title: 'Check WEB/LP/APP',
          attachmentName: 'TEST WEB-GAME-APP',
          attachmentUrl: '',
          priority: 'Cao',
        },
        {
          id: 'ca1-task-3',
          taskLabel: 'Task 3',
          title: 'Check doanh thu hôm qua. Giải trình biến động',
          attachmentName: 'BC114103 - Giải Trình Biến Động 2026',
          attachmentUrl: '',
          priority: 'Rất cao',
        },
      ],
    },
    {
      shiftCode: '4',
      items: [
        {
          id: 'ca4-task-1',
          taskLabel: 'Task 1',
          title: 'Điểm danh',
          attachmentName: '',
          attachmentUrl: '',
          priority: 'Cao',
        },
        {
          id: 'ca4-task-2',
          taskLabel: 'Task 2',
          title: 'Check WEB/LP/APP',
          attachmentName: 'TEST WEB-GAME-APP',
          attachmentUrl: '',
          priority: 'Cao',
        },
      ],
    },
    {
      shiftCode: '6',
      items: [
        {
          id: 'ca6-task-1',
          taskLabel: 'Task 1',
          title: 'Điểm danh',
          attachmentName: 'Check - BC114103 - Điểm Danh Nhân Sự',
          attachmentUrl: '',
          priority: 'Cao',
        },
        {
          id: 'ca6-task-2',
          taskLabel: 'Task 2',
          title: 'Check WEB/LP/APP',
          attachmentName: 'TEST WEB-GAME-APP',
          attachmentUrl: '',
          priority: 'Cao',
        },
      ],
    },
  ],

  dailyShiftAssignments: [],

  teamScheduleMembers: defaultTeamScheduleMembers,
  teamScheduleMonths: defaultTeamScheduleMonths,
};

function cloneDefaultData(): PortalData {
  return JSON.parse(JSON.stringify(defaultData)) as PortalData;
}

function normalizeTask(item: Partial<TaskItem>): TaskItem {
  return {
    id: item.id ?? `task-${Date.now()}`,
    title: item.title ?? '',
    priority: item.priority ?? 'Trung bình',
    status: item.status ?? 'Chưa làm',
    dueDate: item.dueDate ?? '',
    note: item.note ?? '',
    isPinned: item.isPinned ?? false,
  };
}

function normalizeWorkLink(item: Partial<WorkLinkItem>): WorkLinkItem {
  return {
    id: item.id ?? `link-${Date.now()}`,
    title: item.title ?? '',
    url: item.url ?? '',
    note: item.note ?? '',
    isPinned: item.isPinned ?? false,
  };
}

function normalizeReport(item: Partial<ReportItem>): ReportItem {
  return {
    id: item.id ?? `rep-${Date.now()}`,
    name: item.name ?? '',
    owner: item.owner ?? defaultData.profile.displayName,
    updated: item.updated ?? '',
    status: item.status ?? 'Đang xử lý',
    note: item.note ?? '',
    isPinned: item.isPinned ?? false,
  };
}

function normalizeShiftChecklistItem(
  item: Partial<ShiftChecklistItem>
): ShiftChecklistItem {
  return {
    id: item.id ?? `shift-item-${Date.now()}`,
    taskLabel: item.taskLabel ?? '',
    title: item.title ?? '',
    attachmentName: item.attachmentName ?? '',
    attachmentUrl: item.attachmentUrl ?? '',
    priority: item.priority ?? 'Trung bình',
  };
}

function normalizeShiftChecklistGroup(
  item: Partial<ShiftChecklistGroup>
): ShiftChecklistGroup {
  return {
    shiftCode: item.shiftCode ?? '',
    items: Array.isArray(item.items)
      ? item.items.map((row) => normalizeShiftChecklistItem(row))
      : [],
  };
}

function normalizeDailyShiftAssignment(
  item: Partial<DailyShiftAssignment>
): DailyShiftAssignment {
  return {
    date: item.date ?? '',
    memberId: item.memberId ?? '',
    shiftCode: item.shiftCode ?? '1',
    completedTaskIds: Array.isArray(item.completedTaskIds)
      ? item.completedTaskIds
      : [],
  };
}

function normalizeTeamScheduleMember(
  item: Partial<TeamScheduleMember>,
  index: number
): TeamScheduleMember {
  return {
    id: item.id ?? `member-${Date.now()}-${index}`,
    order: item.order ?? index + 1,
    name: item.name ?? '',
    title: item.title ?? '',
  };
}

function normalizeTeamScheduleRow(
  item: Partial<TeamScheduleRow>
): TeamScheduleRow {
  return {
    memberId: item.memberId ?? '',
    dayCodes: Array.isArray(item.dayCodes)
      ? item.dayCodes.map((x) => `${x ?? ''}`)
      : [],
  };
}

function normalizeTeamScheduleMonth(
  item: Partial<TeamScheduleMonth>
): TeamScheduleMonth {
  return {
    month: item.month ?? '',
    rows: Array.isArray(item.rows)
      ? item.rows.map((row) => normalizeTeamScheduleRow(row))
      : [],
  };
}

function normalizeEmployee(
  item: Partial<EmployeeProfile>,
  index: number
): EmployeeProfile {
  return {
    id: item.id ?? `emp-${Date.now()}-${index}`,
    name: item.name ?? '',
    email: item.email ?? '',
    employeeCode: item.employeeCode ?? '',
    group: (item.group ?? 'UP') as EmployeeGroup,
    position: item.position ?? '',
    joinDate: item.joinDate ?? '',
    workStatus: (item.workStatus ?? 'Đang làm việc') as EmployeeWorkStatus,
    monthlyScore: item.monthlyScore ?? '',
    badge: item.badge ?? '',
    avatarUrl: item.avatarUrl ?? '',
    note: item.note ?? '',
  };
}

function normalizePortalData(input: Partial<PortalData>): PortalData {
  return {
    profile: {
      displayName:
        input.profile?.displayName ?? defaultData.profile.displayName,
      email: input.profile?.email ?? defaultData.profile.email,
      role: input.profile?.role ?? defaultData.profile.role,
      timezone: input.profile?.timezone ?? defaultData.profile.timezone,
      language: input.profile?.language ?? defaultData.profile.language,
      theme: input.profile?.theme ?? defaultData.profile.theme,
      notifications:
        input.profile?.notifications ?? defaultData.profile.notifications,
      deadlineReminders:
        input.profile?.deadlineReminders ??
        defaultData.profile.deadlineReminders,
      yubikeyPublicId:
        input.profile?.yubikeyPublicId ?? defaultData.profile.yubikeyPublicId,
      requireYubiKey:
        input.profile?.requireYubiKey ?? defaultData.profile.requireYubiKey,
      demoPassword:
        input.profile?.demoPassword ?? defaultData.profile.demoPassword,
      avatarUrl: input.profile?.avatarUrl ?? defaultData.profile.avatarUrl,

      employeeId: input.profile?.employeeId ?? defaultData.profile.employeeId,
      employeeCode:
        input.profile?.employeeCode ?? defaultData.profile.employeeCode,
      hrGroup: (input.profile?.hrGroup ??
        defaultData.profile.hrGroup) as EmployeeGroup,
      hrPosition: input.profile?.hrPosition ?? defaultData.profile.hrPosition,
      joinDate: input.profile?.joinDate ?? defaultData.profile.joinDate,
      workStatus: (input.profile?.workStatus ??
        defaultData.profile.workStatus) as EmployeeWorkStatus,
      monthlyScore:
        input.profile?.monthlyScore ?? defaultData.profile.monthlyScore,
      employeeBadge:
        input.profile?.employeeBadge ?? defaultData.profile.employeeBadge,
    },

    accounts: Array.isArray(input.accounts)
      ? input.accounts.map((item) => ({
          id: item.id ?? `acc-${Date.now()}`,
          name: item.name ?? '',
          username: item.username ?? '',
          passwordHint: item.passwordHint ?? '',
          note: item.note ?? '',
        }))
      : defaultData.accounts,

    tasks: Array.isArray(input.tasks)
      ? input.tasks.map((item) => normalizeTask(item))
      : defaultData.tasks,

    notes: Array.isArray(input.notes)
      ? input.notes.map((item) => ({
          id: item.id ?? `note-${Date.now()}`,
          text: item.text ?? '',
        }))
      : defaultData.notes,

    workLinks: Array.isArray(input.workLinks)
      ? input.workLinks.map((item) => normalizeWorkLink(item))
      : defaultData.workLinks,

    reports: Array.isArray(input.reports)
      ? input.reports.map((item) => normalizeReport(item))
      : defaultData.reports,

    employees: Array.isArray(input.employees)
      ? input.employees.map((item, index) => normalizeEmployee(item, index))
      : defaultData.employees,

    shiftChecklists: Array.isArray(input.shiftChecklists)
      ? input.shiftChecklists.map((item) => normalizeShiftChecklistGroup(item))
      : defaultData.shiftChecklists,

    dailyShiftAssignments: Array.isArray(input.dailyShiftAssignments)
      ? input.dailyShiftAssignments.map((item) =>
          normalizeDailyShiftAssignment(item)
        )
      : defaultData.dailyShiftAssignments,

    teamScheduleMembers: Array.isArray(input.teamScheduleMembers)
      ? input.teamScheduleMembers.map((item, index) =>
          normalizeTeamScheduleMember(item, index)
        )
      : defaultData.teamScheduleMembers,

    teamScheduleMonths: Array.isArray(input.teamScheduleMonths)
      ? input.teamScheduleMonths.map((item) => normalizeTeamScheduleMonth(item))
      : defaultData.teamScheduleMonths,
  };
}

function buildEmployeeFromProfile(profile: UserProfile): EmployeeProfile {
  return {
    id: profile.employeeId,
    name: profile.displayName,
    email: profile.email,
    employeeCode: profile.employeeCode,
    group: profile.hrGroup,
    position: profile.hrPosition,
    joinDate: profile.joinDate,
    workStatus: profile.workStatus,
    monthlyScore: profile.monthlyScore,
    badge: profile.employeeBadge,
    avatarUrl: profile.avatarUrl,
    note: '',
  };
}

function syncProfileToEmployees(data: PortalData): PortalData {
  const profileEmployee = buildEmployeeFromProfile(data.profile);

  const existingIndex = data.employees.findIndex(
    (item) =>
      item.id === profileEmployee.id ||
      item.email.toLowerCase() === profileEmployee.email.toLowerCase()
  );

  if (existingIndex === -1) {
    return {
      ...data,
      employees: [...data.employees, profileEmployee],
    };
  }

  const nextEmployees = [...data.employees];
  nextEmployees[existingIndex] = {
    ...nextEmployees[existingIndex],
    ...profileEmployee,
    note: nextEmployees[existingIndex].note ?? '',
  };

  return {
    ...data,
    employees: nextEmployees,
  };
}

function emitPortalEvents() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('portal-data-change'));
  window.dispatchEvent(new Event('portal-theme-change'));
}

export function getPortalData(): PortalData {
  if (typeof window === 'undefined') return cloneDefaultData();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      const fresh = cloneDefaultData();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }

    const parsed = JSON.parse(raw) as Partial<PortalData>;
    return syncProfileToEmployees(normalizePortalData(parsed));
  } catch {
    return cloneDefaultData();
  }
}

export function savePortalData(data: PortalData) {
  if (typeof window === 'undefined') return;
  const normalized = syncProfileToEmployees(normalizePortalData(data));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  emitPortalEvents();
}

export function resetPortalData(): PortalData {
  const fresh = cloneDefaultData();

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    emitPortalEvents();
  }

  return fresh;
}
