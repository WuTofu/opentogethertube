// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("ottEnsureToken", () => {
	cy.request("/api/auth/grant").then(resp => {
		window.localStorage.setItem("token", resp.body.token);
	});
});

// @ts-expect-error Cypress doesn't know how to respect this return type
Cypress.Commands.add("ottRequest", (options: Partial<Cypress.RequestOptions>) => {
	if (options.headers === undefined) {
		options.headers = {};
	}
	return cy.window().then(win => {
		// @ts-expect-error
		options.headers.Authorization = `Bearer ${win.localStorage.token}`;
		return cy.request(options).then(resp => {
			cy.wrap(resp).its("isOkStatusCode").should("be.true");
			cy.wrap(resp).its("body").its("success").should("be.true");
			return cy.wrap(resp);
		});
	});
});

Cypress.Commands.add("ottDevRequest", (options: Partial<Cypress.RequestOptions>) => {
	const nodeEnv = Cypress.env("NODE_ENV");
	if (nodeEnv !== "development") {
		Cypress.log({
			name: "ottDevRequest",
			message: `Skipping dev-only endpoint ${options.url} because NODE_ENV=${nodeEnv}`,
		});
		return;
	}
	return cy.ottRequest(options);
});

Cypress.Commands.add("ottResetRateLimit", () => {
	return cy.ottDevRequest({
		method: "POST",
		url: "/api/dev/reset-rate-limit",
	});
});

Cypress.Commands.add("ottResetUserRateLimit", () => {
	return cy.ottDevRequest({
		method: "POST",
		url: "/api/dev/reset-rate-limit/user",
	});
});

Cypress.Commands.add("ottCreateUser", userCreds => {
	return cy.ottRequest({
		method: "POST",
		url: "/api/user/register",
		body: userCreds,
	});
});

Cypress.Commands.add("ottLogin", userCreds => {
	return cy.ottRequest({
		method: "POST",
		url: "/api/user/login",
		body: userCreds,
	});
});

Cypress.Commands.add("ottCreateSocialUser", user => {
	return cy.ottDevRequest({
		method: "POST",
		url: "/api/dev/user/create-social",
		body: user,
	});
});

Cypress.Commands.add("ottForceLogin", username => {
	return cy.ottDevRequest({
		method: "POST",
		url: "/api/dev/user/force-login",
		body: { username },
	});
});

Cypress.Commands.add("ottSetDiscordLink", user => {
	return cy.ottDevRequest({
		method: "POST",
		url: "/api/dev/user/set-discord-link",
		body: user,
	});
});

Cypress.Commands.add("ottSetAdminApiKey", newkey => {
	return cy.ottDevRequest({
		method: "POST",
		url: "/api/dev/set-admin-api-key",
		body: { newkey },
	});
});

Cypress.Commands.add("ottAddFakeUser", (roomName, register = false) => {
	return cy.ottDevRequest({
		method: "POST",
		url: `/api/dev/room/${roomName}/add-fake-user`,
		body: { register },
	});
});

Cypress.Commands.add("ottSliderMove", { prevSubject: "element" }, (subject, percent) => {
	const slider = subject[0];
	const rect = slider.getBoundingClientRect();
	const x = rect.width * percent;
	const y = rect.height / 2;
	cy.log(`Moving slider to ${percent * 100}% at x: ${x} y: ${y}`);
	return cy.wrap(slider).click(x, y);
});

Cypress.Commands.add("ottCloseToasts", () => {
	cy.get('[data-cy="toast-close-all"]').click();
});

export {};
