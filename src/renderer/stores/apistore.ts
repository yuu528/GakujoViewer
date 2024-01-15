import { defineStore } from 'pinia'

/*
import { ReportData } from '../../main/data/reportdata'
import { ContactData } from '../../main/data/contactdata'
import { ExamData } from '../../main/data/examdata'
*/

import { Pages } from '../../main/data/pages'

const statuses = { // enum
	UNCONNECTED: 0,
	CONNECTING: 1,
	CONNECTED: 2
}

export const useApiStore = defineStore('api', {
	state: () => ({
		statuses: statuses,
		status: statuses.UNCONNECTED,
		title: null,
		reportList: [],
		contactList: [],
		examList: [],
		reportListDate: null as Date | null,
		contactListDate: null as Date | null,
		examListDate: null as Date | null
	}),
	actions: {
		async init() {
			this.status = this.statuses.CONNECTING
			await window.electronAPI.initApi()
			this.status = this.statuses.CONNECTED

			this.updateTitle()
		},
		async updateTitle() {
			this.title = await window.electronAPI.getTitle()
		},
		async movePage(page: Pages): Promise<boolean> {
			const result = await window.electronAPI.movePage(page)
			this.updateTitle()
			return result
		},
		async getTable(): Promise<string[][]> {
			return await window.electronAPI.getTable()
		},
		async updateReportList() {
			await this.movePage(Pages.Report)
			this.reportList = await window.electronAPI.getTableData()
			this.reportListDate = new Date()
		},
		async updateContactList() {
			await this.movePage(Pages.Contact)
			this.contactList = await window.electronAPI.getTableData()
			this.contactListDate = new Date()
		},
		async updateExamList() {
			await this.movePage(Pages.Exam)
			this.examList = await window.electronAPI.getTableData()
			this.examListDate = new Date()
		},
	},
	persist: {
		paths: [
			'reportList',
			'contactList',
			'examList'
		]
	}
})
