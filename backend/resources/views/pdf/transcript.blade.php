@extends('pdf.layout')

@section('title', 'ACADEMIC TRANSCRIPT')

@section('content')
    <div class="sub">{{ $filterText }}</div>

    <table class="info">
        <tr>
            <td width="16%">Full name:</td><td width="34%"><strong>{{ $student->user->name }}</strong></td>
            <td width="16%">Student ID:</td><td>{{ $student->student_code }}</td>
        </tr>
        <tr>
            <td>Class:</td><td>{{ $student->schoolClass?->name }}</td>
            <td>Academic years:</td><td>{{ $student->schoolClass?->academic_year }}</td>
        </tr>
        <tr>
            <td>Gender:</td><td>{{ ['male' => 'Male', 'female' => 'Female', 'other' => 'Other'][$student->gender] ?? '' }}</td>
            <td>Date of birth:</td><td>{{ $student->date_of_birth?->format('d/m/Y') }}</td>
        </tr>
    </table>

    @forelse ($transcript['semesters'] as $s)
        <h2>{{ $s['semester']['name'] }}@if ($s['semester']['is_current']) (in progress)@endif</h2>
        <table>
            <thead>
                <tr>
                    <th width="11%">Section</th><th>Subject</th><th class="c" width="6%">Cr.</th>
                    <th class="c" width="9%">Midterm</th><th class="c" width="9%">Final</th>
                    <th class="c" width="10%">Total</th><th class="c" width="9%">Grade</th><th class="c" width="11%">Result</th>
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
                            @elseif ($c['passed']) <span class="ok">Passed</span>
                            @else <span class="bad">Failed</span>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
        <table class="summary">
            <tr>
                <td>Credits registered: <strong>{{ $s['registered_credits'] }}</strong></td>
                <td>Semester average: <strong>{{ $s['gpa'] ?? '—' }}</strong></td>
                <td>4.0 scale: <strong>{{ $s['gpa4'] ?? '—' }}</strong></td>
                <td>Classification: <strong>{{ $s['classification'] ?? '—' }}</strong></td>
            </tr>
        </table>
    @empty
        <p class="muted">No data matches the selected filters.</p>
    @endforelse

    <h2>Summary</h2>
    <div class="box">
        <table class="summary">
            <tr>
                <td>Average (10 scale): <strong>{{ $transcript['cumulative']['gpa'] ?? '—' }}</strong></td>
                <td>Average (4.0 scale): <strong>{{ $transcript['cumulative']['gpa4'] ?? '—' }}</strong></td>
                <td>Classification: <strong>{{ $transcript['cumulative']['classification'] ?? '—' }}</strong></td>
            </tr>
            <tr>
                <td>Graded credits: <strong>{{ $transcript['cumulative']['graded_credits'] }}</strong></td>
                <td>Credits passed: <strong class="ok">{{ $transcript['cumulative']['credits_earned'] }}</strong></td>
                <td>Credits failed: <strong class="bad">{{ $transcript['cumulative']['credits_failed'] }}</strong></td>
            </tr>
        </table>
        @if ($transcript['standing']['warning'])<div class="bad">{{ $transcript['standing']['warning'] }}</div>@endif
        @if ($transcript['standing']['scholarship'])<div class="ok">{{ $transcript['standing']['scholarship'] }}</div>@endif
    </div>

    <table class="sign">
        <tr><td width="50%"></td><td>Prepared by<br><span class="muted">(Signature and full name)</span></td></tr>
    </table>
@endsection
