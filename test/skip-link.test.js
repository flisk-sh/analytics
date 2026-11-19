import { expect, test } from 'bun:test';
import { CSS } from '../src/css.js';
import {
  layout,
  loginPage,
  messagePage,
  newSitePage,
  sitesPage,
  tokensPage,
} from '../src/ui.js';

const skip = '<a class="skip-link" href="#main">Skip to content</a>';

test('layout puts the skip link first in the body', () => {
  const html = layout('Test', '<main id="main">content</main>');
  expect(html).toContain(`<body>${skip}`);
  expect(html.indexOf(skip)).toBeLessThan(html.indexOf('<main id="main">'));
});

test('every cabinet page has a main target for the skip link', () => {
  const pages = [
    loginPage(),
    messagePage('Error', 'Text'),
    messagePage('Error', 'Text', 'alice'),
    sitesPage('alice'),
    newSitePage('alice'),
    tokensPage('alice', []),
  ];
  for (const html of pages) {
    expect(html).toContain(skip);
    expect(html).toContain('<main id="main"');
  }
});

test('the skip link is hidden until focused', () => {
  expect(CSS).toContain('.skip-link{position:absolute;left:-9999px');
  expect(CSS).toContain('.skip-link:focus{left:12px;top:12px');
});
