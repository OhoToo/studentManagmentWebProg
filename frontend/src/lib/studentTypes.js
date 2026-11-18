/**
 * Студент из ответа Java API (StudentDto).
 * @typedef {Object} Student
 * @property {string} ID UUID студента.
 * @property {string} fullName ФИО.
 * @property {string} ISU Номер ИСУ из шести цифр.
 * @property {string} group Учебная группа.
 * @property {number | null} dormNumber Номер общежития.
 * @property {number | null} room Номер комнаты.
 * @property {string | null} dateArrived Дата заселения в формате YYYY-MM-DD.
 * @property {boolean} isForeign Иностранный студент.
 * @property {string} notes Заметки.
 * @typedef {Omit<Student, 'ID'>} StudentInput Данные формы без ID, который создаёт Java.
 */

export {};
