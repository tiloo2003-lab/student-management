@extends('pdf.layout')

@section('title', 'COURSE SECTION GRADE SHEET')

@section('content')
    <div class="sub">{{ $course->semester->name }}</div>

    <table class="info">
        <tr>
            <td width="16%">Section code:</td><td width="34%"><strong>{{ $course->code }}</strong></td>
            <td width="16%">Subject:</td><td>{{ $course->subject->name }} ({{ $course->subject->credits }} credits)</td>
        </tr>
        <tr>
            <td>Teacher:</td><td>{{ $course->teacher?->user?->name }}</td>
            <td>Enrolled:</td><td>{{ count($students) }} students</td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th class="c" width="5%">No.</th><th width="12%">Student ID</th><th>Full name</th><th width="10%">Class</th>
                <th class="c" width="10%">Absent</th><th class="c" width="9%">Midterm</th><th class="c" width="9%">Final</th>
                <th class="c" width="10%">Total</th><th class="c" width="8%">Grade</th>
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
                        @if ($e['attendance']['banned']) <span class="bad">(exam ban)</span>@endif
                    </td>
                    <td class="c">{{ $e['grade']['midterm'] ?? '—' }}</td>
                    <td class="c">{{ $e['grade']['final'] ?? '—' }}</td>
                    <td class="c"><strong>{{ $e['grade']['total'] ?? '—' }}</strong></td>
                    <td class="c">{{ $e['grade']['letter'] ?? '—' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <p class="muted">Total = Midterm × 40% + Final × 60% (10-point scale).</p>

    <table class="sign">
        <tr><td width="50%">Head of department</td><td>Teacher in charge<br><span class="muted">(Signature and full name)</span></td></tr>
    </table>
@endsection
