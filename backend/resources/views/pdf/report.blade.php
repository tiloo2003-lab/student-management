@extends('pdf.layout')

@section('title', 'BÁO CÁO HỌC VỤ')

@section('content')
    <div class="sub">
        {{ $report['semester']['name'] }}@if ($className) · Lớp {{ $className }}@endif
    </div>

    <div class="box">
        <table class="summary">
            <tr>
                <td>Sinh viên đăng ký: <strong>{{ $report['summary']['students'] }}</strong></td>
                <td>Lượt đăng ký: <strong>{{ $report['summary']['enrollments'] }}</strong> ({{ $report['summary']['graded'] }} có điểm)</td>
                <td>Điểm trung bình: <strong>{{ $report['summary']['average'] ?? '—' }}</strong></td>
                <td>Tỉ lệ đạt: <strong>{{ isset($report['summary']['pass_rate']) ? $report['summary']['pass_rate'] . '%' : '—' }}</strong></td>
            </tr>
        </table>
    </div>

    <h2>Kết quả theo lớp học phần</h2>
    <table>
        <thead>
            <tr><th>Mã LHP</th><th>Môn học</th><th>Giáo viên</th><th class="c">Sĩ số</th><th class="c">Có điểm</th><th class="c">ĐTB</th><th class="c">Tỉ lệ đạt</th></tr>
        </thead>
        <tbody>
            @forelse ($report['courses'] as $c)
                <tr>
                    <td>{{ $c['code'] }}</td><td>{{ $c['subject'] }}</td><td>{{ $c['teacher'] }}</td>
                    <td class="c">{{ $c['enrolled'] }}</td><td class="c">{{ $c['graded'] }}</td>
                    <td class="c">{{ $c['average'] ?? '—' }}</td>
                    <td class="c">{{ isset($c['pass_rate']) ? $c['pass_rate'] . '%' : '—' }}</td>
                </tr>
            @empty
                <tr><td colspan="7" class="muted">Không có dữ liệu.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h2>Điểm trung bình theo lớp</h2>
    <table>
        <thead><tr><th>Lớp</th><th class="c">Sinh viên</th><th class="c">ĐTB</th></tr></thead>
        <tbody>
            @forelse ($report['classes'] as $c)
                <tr><td>{{ $c['class'] }}</td><td class="c">{{ $c['students'] }}</td><td class="c">{{ $c['average_gpa'] }}</td></tr>
            @empty
                <tr><td colspan="3" class="muted">Không có dữ liệu.</td></tr>
            @endforelse
        </tbody>
    </table>

    @foreach ([['Top sinh viên xuất sắc', 'top_students'], ['Cảnh báo học vụ (ĐTB kỳ dưới ' . config('school.warning_gpa') . ')', 'warnings'], ['Đủ điều kiện xét học bổng', 'scholarships']] as [$title, $key])
        <h2>{{ $title }}</h2>
        <table>
            <thead><tr><th>MSSV</th><th>Họ và tên</th><th>Lớp</th><th class="c">ĐTB kỳ</th><th class="c">Tín chỉ</th><th class="c">TC chưa đạt</th></tr></thead>
            <tbody>
                @forelse ($report[$key] as $s)
                    <tr>
                        <td>{{ $s['student_code'] }}</td><td>{{ $s['name'] }}</td><td>{{ $s['class'] }}</td>
                        <td class="c">{{ $s['gpa'] }}</td><td class="c">{{ $s['credits'] }}</td><td class="c">{{ $s['credits_failed'] }}</td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="muted">Không có sinh viên nào.</td></tr>
                @endforelse
            </tbody>
        </table>
    @endforeach
@endsection
