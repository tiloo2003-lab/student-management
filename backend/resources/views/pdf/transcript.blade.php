@extends('pdf.layout')

@section('title', 'KẾT QUẢ HỌC TẬP')

@section('content')
    <div class="sub">{{ $filterText }}</div>

    <table class="info">
        <tr>
            <td width="16%">Họ và tên:</td><td width="34%"><strong>{{ $student->user->name }}</strong></td>
            <td width="16%">Mã sinh viên:</td><td>{{ $student->student_code }}</td>
        </tr>
        <tr>
            <td>Lớp:</td><td>{{ $student->schoolClass?->name }}</td>
            <td>Niên khóa:</td><td>{{ $student->schoolClass?->academic_year }}</td>
        </tr>
        <tr>
            <td>Giới tính:</td><td>{{ ['male' => 'Nam', 'female' => 'Nữ', 'other' => 'Khác'][$student->gender] ?? '' }}</td>
            <td>Ngày sinh:</td><td>{{ $student->date_of_birth?->format('d/m/Y') }}</td>
        </tr>
    </table>

    @forelse ($transcript['semesters'] as $s)
        <h2>{{ $s['semester']['name'] }}@if ($s['semester']['is_current']) (đang diễn ra)@endif</h2>
        <table>
            <thead>
                <tr>
                    <th width="11%">Mã LHP</th><th>Môn học</th><th class="c" width="6%">TC</th>
                    <th class="c" width="9%">Giữa kỳ</th><th class="c" width="9%">Cuối kỳ</th>
                    <th class="c" width="10%">Tổng kết</th><th class="c" width="9%">Xếp loại</th><th class="c" width="11%">Kết quả</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($s['courses'] as $c)
                    <tr>
                        <td>{{ $c['code'] }}</td>
                        <td>{{ $c['name'] }}</td>
                        <td class="c">{{ $c['credits'] }}</td>
                        <td class="c">{{ $c['midterm'] ?? '—' }}</td>
                        <td class="c">{{ $c['final'] ?? '—' }}</td>
                        <td class="c"><strong>{{ $c['total'] ?? '—' }}</strong></td>
                        <td class="c">{{ $c['letter'] ?? '—' }}</td>
                        <td class="c">
                            @if ($c['passed'] === null) —
                            @elseif ($c['passed']) <span class="ok">Đạt</span>
                            @else <span class="bad">Không đạt</span>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
        <table class="summary">
            <tr>
                <td>Tín chỉ đăng ký: <strong>{{ $s['registered_credits'] }}</strong></td>
                <td>ĐTB học kỳ: <strong>{{ $s['gpa'] ?? '—' }}</strong></td>
                <td>Hệ 4: <strong>{{ $s['gpa4'] ?? '—' }}</strong></td>
                <td>Xếp loại: <strong>{{ $s['classification'] ?? '—' }}</strong></td>
            </tr>
        </table>
    @empty
        <p class="muted">Không có dữ liệu phù hợp với bộ lọc đã chọn.</p>
    @endforelse

    <h2>Tổng hợp</h2>
    <div class="box">
        <table class="summary">
            <tr>
                <td>Điểm TB (hệ 10): <strong>{{ $transcript['cumulative']['gpa'] ?? '—' }}</strong></td>
                <td>Điểm TB (hệ 4): <strong>{{ $transcript['cumulative']['gpa4'] ?? '—' }}</strong></td>
                <td>Xếp loại học lực: <strong>{{ $transcript['cumulative']['classification'] ?? '—' }}</strong></td>
            </tr>
            <tr>
                <td>Tín chỉ có điểm: <strong>{{ $transcript['cumulative']['graded_credits'] }}</strong></td>
                <td>Tín chỉ đạt: <strong class="ok">{{ $transcript['cumulative']['credits_earned'] }}</strong></td>
                <td>Tín chỉ chưa đạt: <strong class="bad">{{ $transcript['cumulative']['credits_failed'] }}</strong></td>
            </tr>
        </table>
        @if ($transcript['standing']['warning'])<div class="bad">{{ $transcript['standing']['warning'] }}</div>@endif
        @if ($transcript['standing']['scholarship'])<div class="ok">{{ $transcript['standing']['scholarship'] }}</div>@endif
    </div>

    <table class="sign">
        <tr><td width="50%"></td><td>Người lập bảng<br><span class="muted">(Ký, ghi rõ họ tên)</span></td></tr>
    </table>
@endsection
