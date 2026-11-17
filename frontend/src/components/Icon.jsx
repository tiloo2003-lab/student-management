export default function Icon({ name, ...props }) {
  const paths = {
    news: 'M4 3h16v18H4V3Zm3 4h10M7 11h4v4H7v-4Zm7 0h3m-3 4h3M7 18h10',
    menu: 'M4 6h16M4 12h16M4 18h16',
    search: 'M21 21l-6-6M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14',
    book: 'M12 5v16M12 5C8 2 4 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-2-1-6-2-10 1',
    chart: 'M4 3v18h17M8 16v-4m5 4V8m5 8V5',
    school: 'M3 10 12 5l9 5-9 5-9-5Zm4 3v5c3 2 7 2 10 0v-5M21 10v7',
    mail: 'M3 5h18v14H3V5Zm0 1 9 7 9-7',
    lock: 'M5 10h14v11H5V10Zm3 0V7a4 4 0 0 1 8 0v3M12 14v3',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
    admin: 'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Zm-4 9 3 3 5-6',
    teacher: 'M3 4h18v12H9M12 8h5M12 11h3M3 21v-3a3 3 0 0 1 6 0v3M6 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4',
    arrow: 'M4 12h16m-6-6 6 6-6 6',
    calendar: 'M4 5h16v16H4V5Zm4-3v6m8-6v6M4 10h16M8 14h2m4 0h2m-8 3h2',
  };
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name] || paths.school} /></svg>;
}

