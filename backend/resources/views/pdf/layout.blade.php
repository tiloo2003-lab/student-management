<!doctype html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <title>@yield('title')</title>
    <style>
        @page { margin: 28px 34px; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 10.5px; color: #222; }
        h1 { font-size: 17px; text-align: center; margin: 4px 0 2px; letter-spacing: .5px; }
        h2 { font-size: 12.5px; margin: 16px 0 6px; padding-bottom: 3px; border-bottom: 1.5px solid #ff8a1f; color: #b85c00; }
        .school { text-align: center; font-size: 10px; color: #666; }
        .sub { text-align: center; color: #555; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        th { background: #ff9a2e; color: #fff; text-align: left; padding: 5px 6px; font-size: 9.5px; }
        td { border-bottom: 1px solid #e6e6e6; padding: 4px 6px; vertical-align: top; }
        .info td { border: 0; padding: 2px 6px; }
        .c { text-align: center; }
        .r { text-align: right; }
        .ok { color: #16833a; }
        .bad { color: #c62828; }
        .muted { color: #777; }
        .box { border: 1px solid #ffd2a0; background: #fff7ec; padding: 7px 10px; margin: 8px 0; }
        .summary td { border: 0; padding: 2px 6px; }
        .sign { margin-top: 26px; width: 100%; }
        .sign td { border: 0; text-align: center; }
        .foot { margin-top: 14px; font-size: 9px; color: #888; text-align: right; }
    </style>
</head>
<body>
    <div class="school">QL SINH VIÊN · Cổng thông tin nhà trường</div>
    <h1>@yield('title')</h1>
    @yield('content')
    <div class="foot">Xuất ngày {{ $generatedAt }}</div>
</body>
</html>
