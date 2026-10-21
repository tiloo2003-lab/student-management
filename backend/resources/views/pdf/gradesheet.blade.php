@extends('pdf.layout')

@section('title', 'BẢNG ĐIỂM LỚP HỌC PHẦN')

@section('content')
    <div class="sub">{{ $course->semester->name }}</div>

    <table class="info">
        <tr>
            <td width="16%">Mã lớp học phần:</td><td width="34%"><strong>{{ $course->code }}</strong></td>
            <td width="16%">Môn học:</td><td>{{ $course->subject->name }} ({{ $course->subject->credits }} tín chỉ)</td>
        </tr>
        <tr>
            <td>Giáo viên:</td><td>{{ $course->teacher?->user?->name }}</td>
            <td>Sĩ số:</td><td>{{ count($students) }} sinh viên</td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th class="c" width="5%">STT</th><th width="12%">MSSV</th><th>Họ và tên</th><th width="10%">Lớp</th>
                <th class="c" width="10%">Vắng</th><th class="c" width="9%">Giữa kỳ</th><th class="c" width="9%">Cuối kỳ</th>
                <th class="c" width="10%">Tổng kết</th><th class="c" width="8%">Xếp loại</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($students as $i => $e)
                <tr>
                    <td class="c">{{ $i + 1 }}</td>
                    <td>{{ $e['student']['student_code'] }}</td>
                    <td>{{ $e['student']['user']['name'] }}</td>
                    <td>{{ $e['student']['school_class']['code'] ?? '' }}</td>
                    <td class="c">
                        {{ $e['attendance']['absent'] }}/{{ $e['attendance']['sessions'] }}
                        @if ($e['attendance']['banned']) <span class="bad">(cấm thi)</span>@endif
                    </td>
                    <td class="c">{{ $e['grade']['midterm'] ?? '—' }}</td>
                    <td class="c">{{ $e['grade']['final'] ?? '—' }}</td>
                    <td class="c"><strong>{{ $e['grade']['total'] ?? '—' }}</strong></td>
                    <td class="c">{{ $e['grade']['letter'] ?? '—' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <p class="muted">Tổng kết = Giữa kỳ × 40% + Cuối kỳ × 60% (thang điểm 10).</p>

    <table class="sign">
        <tr><td width="50%">Trưởng khoa</td><td>Giáo viên phụ trách<br><span class="muted">(Ký, ghi rõ họ tên)</span></td></tr>
    </table>
@endsection
