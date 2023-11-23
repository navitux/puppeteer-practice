const puppeteer = require('puppeteer');

const USER = process.env.TODOIST_USER;
const PASSWORD = process.env.TODOIST_PASS;
const A_MINUTE = 60000;
const WAIT_TIME = 4000;

async function scrap(){

	const browser = await puppeteer.launch({
		headless: false
		,slowMo: 40
	});
	/* FIRST PART: TRELLO */
	const page = await browser.newPage();
	
	// going to Trello
	await page.goto('https://trello.com/b/QvHVksDa/personal-work-goals',
		{waitUntil: 'load', timeout: A_MINUTE});
	// closing modal
	await page.click('button[data-testid=\"about-this-board-modal-cta-button\"]');
	// closing side menu
	await page.click('a[title=\"Close the board menu.\"]');
	
	// localizing and retrieving the card/task with a list with at least 5 elements
	await page.evaluate(()=>{
		const anchors = document.getElementsByClassName('NdQKKfeqJDDdX3')
		anchors[21].scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest' });
		anchors[21].click();
	});
	
	await page.waitForTimeout(WAIT_TIME/2);
	
	const trello_todo_list = await page.evaluate(()=>{
		const list = document.querySelector('.checklist-items-list');
		list.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest' });
		return list.innerText.split('\n');
	});
	
	/* SECOND PART: TODOIST */
	// going to Todoist login
	await page.goto('https://todoist.com/auth/login');

	await page.waitForTimeout(WAIT_TIME);

	await page.evaluate(()=>{
		const password_field = document.getElementById('element-3');
		password_field.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'});
	});
	await page.focus('#element-0');
	await page.keyboard.type(USER)

	await page.focus('#element-3');
	await page.keyboard.type(PASSWORD);

	await page.evaluate(()=>{
		const submit = document.querySelector('[data-gtm-id="start-email-login"]');
		submit.click();
	});

	await page.waitForTimeout(WAIT_TIME*2);

	// once logged in, add tasks, but first, open the modal just once
	await page.evaluate(()=>{
		const add_task = document.querySelector('[data-add-task-navigation-element="true"]');
		add_task.click();
	});

	await page.waitForTimeout(WAIT_TIME);

	for( entry of trello_todo_list){
		console.log(entry);
		await page.evaluate((entry)=>{
			const task_entry = document.querySelector('[data-placeholder="Nombre de la tarea"]');

			task_entry.innerText = entry;

		},entry);
		await page.waitForTimeout(WAIT_TIME/2);

		await page.click('button[data-testid=\"task-editor-submit-button\"]');

		await page.waitForTimeout(WAIT_TIME/2);

	}

	// EXIT
	await browser.close();
}

scrap();
