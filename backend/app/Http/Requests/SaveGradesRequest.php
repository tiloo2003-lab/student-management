<?php

namespace App\Http\Requests;

class SaveGradesRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'grades' => ['required', 'array', 'min:1'],
            'grades.*.enrollment_id' => ['required', 'integer'],
            'grades.*.midterm' => ['nullable', 'numeric', 'between:0,10'],
            'grades.*.final' => ['nullable', 'numeric', 'between:0,10'],
        ];
    }

    public function messages(): array
    {
        return [
            'grades.required' => 'Vui lòng nhập điểm cho ít nhất một sinh viên.',
            'grades.*.midterm.between' => 'Điểm giữa kỳ phải từ 0 đến 10.',
            'grades.*.final.between' => 'Điểm cuối kỳ phải từ 0 đến 10.',
            'grades.*.midterm.numeric' => 'Điểm giữa kỳ phải là số.',
            'grades.*.final.numeric' => 'Điểm cuối kỳ phải là số.',
        ];
    }
}
