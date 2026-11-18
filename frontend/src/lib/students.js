import { defer, map, Subject } from 'rxjs';
import { api, ApiError } from './api.js';

/** @returns {import('rxjs').Observable<import('./studentTypes.js').Student[]>} */
export function loadStudents() {
    return defer(() => api('/api/requests')).pipe(
        map(students => {
            if (!Array.isArray(students)) {
                throw new ApiError(502, 'Сервер вернул список студентов в неожиданном формате.');
            }
            return students;
        })
    );
}

/** @typedef {import('./studentTypes.js').Student} Student */
/** @typedef {import('./studentTypes.js').StudentInput} StudentInput */
/** @typedef {{ key: keyof StudentInput, order: 'ASC' | 'DESC', selectionNumber: number }} SortRule */
/**
 * @typedef {Object} StudentView
 * @property {Student[]} students
 * @property {string} search
 * @property {Record<keyof StudentInput, string>} filters
 * @property {SortRule[]} sortKeys
 * @property {number} start
 * @property {number} visibleCount
 */

/** @param {Student[]} list @param {StudentView['filters']} filters @param {string} [search] */
export function filterStudents(list, filters, search = '') {
    const query = search.trim().toLowerCase();
    return list.filter(student => {
        if (query !== '') {
            const matchesSearch = Object.values(student).some(value => {
                if (value == null) return false;
                const text = String(value).toLowerCase();
                return text.includes(query);
            });
            if (!matchesSearch) return false;
        }

        for (const [field, value] of Object.entries(filters)) {
            const expected = value.trim();
            if (expected === '') continue;

            const actual = student[/** @type {keyof Student} */ (field)];
            if (actual == null) return false;

            if (field === 'isForeign') {
                if (actual !== (expected === 'true')) return false;
            } else if (field === 'dormNumber' || field === 'room') {
                if (actual !== Number(expected)) return false;
            } else if (field === 'dateArrived') {
                if (actual !== expected) return false;
            } else {
                if (!String(actual).toLowerCase().includes(expected.toLowerCase())) return false;
            }
        }
        return true;
    });
}

/** @param {Student[]} list @param {SortRule[]} sortKeys */
export function sortStudents(list, sortKeys) {
    const activeRules = sortKeys.filter(rule => rule.selectionNumber > 0);
    activeRules.sort((a, b) => a.selectionNumber - b.selectionNumber);

    const sortedStudents = [...list];
    sortedStudents.sort((a, b) => {
        for (const rule of activeRules) {
            const left = a[rule.key];
            const right = b[rule.key];
            if (left === right) continue;
            if (left == null) return 1;
            if (right == null) return -1;

            let comparison;
            if (typeof left === 'string' && typeof right === 'string') {
                comparison = left.localeCompare(right, 'ru', { numeric: true, sensitivity: 'base' });
            } else {
                comparison = Number(left) - Number(right);
            }

            if (comparison === 0) continue;
            if (rule.order === 'DESC') comparison = -comparison;
            return comparison;
        }
        return 0;
    });
    return sortedStudents;
}

export function createStudentView() {
    /** @type {Subject<StudentView>} */
    const changes = new Subject();
    const results = changes.pipe(
        map(options => {
            const filtered = filterStudents(options.students, options.filters, options.search);
            const sorted = sortStudents(filtered, options.sortKeys);
            const maxStart = Math.max(0, sorted.length - options.visibleCount);
            const start = Math.max(0, Math.min(options.start, maxStart));

            return {
                students: sorted.slice(start, start + options.visibleCount),
                total: sorted.length,
                start
            };
        })
    );
    return { changes, results };
}
