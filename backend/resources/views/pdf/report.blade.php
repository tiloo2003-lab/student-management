@extends('pdf.layout')

@section('title', 'ACADEMIC REPORT')

@section('content')
    <div class="sub">
        {{ $report['semester']['name'] }}@if ($className) · Class {{ $className }}@endif
    </div>

    <div class="box">
        <table class="summary">
            <tr>
                <td>Registered students: <strong>{{ $report['summary']['students'] }}</strong></td>
                <td>Enrollments: <strong>{{ $report['summary']['enrollments'] }}</strong> ({{ $report['summary']['graded'] }} graded)</td>
                <td>Average score: <strong>{{ $report['summary']['average'] ?? '—' }}</strong></td>
                <td>Pass rate: <strong>{{ isset($report['summary']['pass_rate']) ? $report['summary']['pass_rate'] . '%' : '—' }}</strong></td>
            </tr>
        </table>
    </div>

    <h2>Results by course section</h2>
    <table>
        <thead>
            <tr><th>Section</th><th>Subject</th><th>Teacher</th><th class="c">Enrolled</th><th class="c">Graded</th><th class="c">Average</th><th class="c">Pass rate</th></tr>
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
                <tr><td colspan="7" class="muted">No data.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h2>Average score by class</h2>
    <table>
        <thead><tr><th>Class</th><th class="c">Students</th><th class="c">Average</th></tr></thead>
        <tbody>
            @forelse ($report['classes'] as $c)
                <tr><td>{{ $c['class'] }}</td><td class="c">{{ $c['students'] }}</td><td class="c">{{ $c['average_gpa'] }}</td></tr>
            @empty
                <tr><td colspan="3" class="muted">No data.</td></tr>
            @endforelse
        </tbody>
    </table>

    @foreach ([['Top students', 'top_students'], ['Academic warnings (semester average below ' . config('school.warning_gpa') . ')', 'warnings'], ['Scholarship candidates', 'scholarships']] as [$title, $key])
        <h2>{{ $title }}</h2>
        <table>
            <thead><tr><th>Student ID</th><th>Full name</th><th>Class</th><th class="c">Semester avg.</th><th class="c">Credits</th><th class="c">Failed credits</th></tr></thead>
            <tbody>
                @forelse ($report[$key] as $s)
                    <tr>
                        <td>{{ $s['student_code'] }}</td><td>{{ $s['name'] }}</td><td>{{ $s['class'] }}</td>
                        <td class="c">{{ $s['gpa'] }}</td><td class="c">{{ $s['credits'] }}</td><td class="c">{{ $s['credits_failed'] }}</td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="muted">No students.</td></tr>
                @endforelse
            </tbody>
        </table>
    @endforeach
@endsection
