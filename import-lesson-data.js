
import mongoose from 'mongoose';
import Board from './models/Board.js';
import ClassLevel from './models/ClassLevel.js';
import Subject from './models/Subject.js';
import Chapter from './models/Chapter.js';
import Unit from './models/Unit.js';
import Module from './models/Module.js';
import CurriculumItem from './models/CurriculumItem.js';
import dotenv from 'dotenv';

dotenv.config();

// Lesson data to import
const lessonData = {
  "class_title": 6,
  "board_title": "CBSE",
  "subject_title": "Social Studies",
  "chapter_title": "Chapter 9: Family and Community",
  "unit_title": "Unit 1: Family",
  "lessons": [
    {
      "lesson_title": "Siblings, cousins & exteneded family",
      "concepts": [
        {
          "type": "statement",
          "text": "Raj and Rani's children are Lakshman, Ram, and Geeta. Brothers and sisters are called siblings.",
          "question": null,
          "answer": null,
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738513/hoshiyaar-test/yypmxbugipr4drtvyxjz.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738339/hoshiyaar-test/zueq3fw8pf6hixqd7slj.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "Raj and Rani's children are Lakshman, Ram, and Geeta. Lakshman is Ram's b........",
          "answer": "brother",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738513/hoshiyaar-test/yypmxbugipr4drtvyxjz.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "Raj and Rani's children are Lakshman, Ram, and Geeta. Geeta is Ram's s.........",
          "answer": "sister",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738339/hoshiyaar-test/zueq3fw8pf6hixqd7slj.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "Brother and sister together are called s........",
          "answer": "siblings",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738513/hoshiyaar-test/yypmxbugipr4drtvyxjz.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738339/hoshiyaar-test/zueq3fw8pf6hixqd7slj.png"
          ]
        },
        {
          "type": "statement",
          "text": "Raj is Ram's father. Raj's younger brother is Prashant; he is Ram's uncle.",
          "question": null,
          "answer": null,
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/vgsdohp5vhzsu2e5uhhx.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/rm2uvddekbsiwmhkyoxb.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "Raj is Ram's father. Raj's younger brother is Prashant. Prashant is Ram's u.........",
          "answer": "uncle",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/vgsdohp5vhzsu2e5uhhx.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/rm2uvddekbsiwmhkyoxb.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "statement",
          "text": "Raj is Ram's father. Raj's younger brother is Prashant. In Hindi, Prashant is Ram's chacha.",
          "question": null,
          "answer": null,
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/vgsdohp5vhzsu2e5uhhx.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/rm2uvddekbsiwmhkyoxb.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "Raj is Ram's father. Raj's younger brother is Prashant. In Hindi, Prashant is Ram's c........",
          "answer": "chacha",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/vgsdohp5vhzsu2e5uhhx.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/rm2uvddekbsiwmhkyoxb.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "statement",
          "text": "In English, chacha is called an uncle.",
          "question": null,
          "answer": null,
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/vgsdohp5vhzsu2e5uhhx.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "In English, chacha is an u........",
          "answer": "uncle",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/vgsdohp5vhzsu2e5uhhx.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "statement",
          "text": "Rani is Ram's mother. Rani's younger brother is Rohit; he is Ram's uncle.",
          "question": null,
          "answer": null,
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/u4ngn59npczjfsomiiap.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738715/hoshiyaar-test/a75ctl9vkisdtuvjnjas.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "Rani is Ram's mother. Rani's younger brother is Rohit. Rohit is Ram's u.........",
          "answer": "uncle",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/u4ngn59npczjfsomiiap.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738715/hoshiyaar-test/a75ctl9vkisdtuvjnjas.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "statement",
          "text": "Rani is Ram's mother. Rani's younger brother is Rohit. In Hindi, Rohit is Ram's. In Hindi, Rohit is Ram's mama.",
          "question": null,
          "answer": null,
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/u4ngn59npczjfsomiiap.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738715/hoshiyaar-test/a75ctl9vkisdtuvjnjas.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "Rani is Ram's mother. Rani's younger brother is Rohit. In Hindi, Rohit is Ram's m........",
          "answer": "mama",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/u4ngn59npczjfsomiiap.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738715/hoshiyaar-test/a75ctl9vkisdtuvjnjas.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "statement",
          "text": "In English, mama is called an uncle.",
          "question": null,
          "answer": null,
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738715/hoshiyaar-test/a75ctl9vkisdtuvjnjas.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "In English, mama is an u.........",
          "answer": "uncle",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738715/hoshiyaar-test/a75ctl9vkisdtuvjnjas.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "Father's brother is called an u.........",
          "answer": "uncle",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/vgsdohp5vhzsu2e5uhhx.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/rm2uvddekbsiwmhkyoxb.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "Father's b........ is called an uncle.",
          "answer": "brother",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/vgsdohp5vhzsu2e5uhhx.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/rm2uvddekbsiwmhkyoxb.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "Mothers brother is called an u.........",
          "answer": "uncle",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/u4ngn59npczjfsomiiap.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738715/hoshiyaar-test/a75ctl9vkisdtuvjnjas.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "Mother's b........ is called an uncle.",
          "answer": "brother",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/u4ngn59npczjfsomiiap.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738715/hoshiyaar-test/a75ctl9vkisdtuvjnjas.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "statement",
          "text": "In English, both Mama and Chacha are called uncle.",
          "question": null,
          "answer": null,
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738715/hoshiyaar-test/a75ctl9vkisdtuvjnjas.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/vgsdohp5vhzsu2e5uhhx.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "In English, both Mama and Chacha are called u.........",
          "answer": "uncle",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738715/hoshiyaar-test/a75ctl9vkisdtuvjnjas.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/vgsdohp5vhzsu2e5uhhx.png"
          ]
        },
        {
          "type": "statement",
          "text": "Prashant is Ram's uncle. Prashant's son is Himesh; he is Ram's cousin.",
          "question": null,
          "answer": null,
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/vgsdohp5vhzsu2e5uhhx.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738425/hoshiyaar-test/pyhwojbtn47mbk6q1euy.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "Prashant is Ram's uncle. Prashant's son is Himesh. Himesh is Ram's c.........",
          "answer": "cousin",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/vgsdohp5vhzsu2e5uhhx.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738425/hoshiyaar-test/pyhwojbtn47mbk6q1euy.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "statement",
          "text": "Rohit is Ram's uncle. Rohit's daughter is Rekha; she is Ram's cousin.",
          "question": null,
          "answer": null,
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738715/hoshiyaar-test/a75ctl9vkisdtuvjnjas.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738715/hoshiyaar-test/n2foy4ful9lak3vu6fze.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "Rohit is Ram's uncle. Rohit's daughter is Rekha. Rekha is Ram's c.........",
          "answer": "cousin",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738715/hoshiyaar-test/a75ctl9vkisdtuvjnjas.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738715/hoshiyaar-test/n2foy4ful9lak3vu6fze.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "statement",
          "text": "Uncle's children are called cousins.",
          "question": null,
          "answer": null,
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738425/hoshiyaar-test/pyhwojbtn47mbk6q1euy.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738715/hoshiyaar-test/n2foy4ful9lak3vu6fze.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "Uncle's children are called c.........",
          "answer": "cousins",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738425/hoshiyaar-test/pyhwojbtn47mbk6q1euy.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738715/hoshiyaar-test/n2foy4ful9lak3vu6fze.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "statement",
          "text": "Siblings share the same mother and father.",
          "question": null,
          "answer": null,
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738513/hoshiyaar-test/yypmxbugipr4drtvyxjz.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738339/hoshiyaar-test/zueq3fw8pf6hixqd7slj.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "Siblings share the same m......... and father.",
          "answer": "mother",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738513/hoshiyaar-test/yypmxbugipr4drtvyxjz.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738339/hoshiyaar-test/zueq3fw8pf6hixqd7slj.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "Siblings share the same mother and f..........",
          "answer": "father",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738513/hoshiyaar-test/yypmxbugipr4drtvyxjz.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738339/hoshiyaar-test/zueq3fw8pf6hixqd7slj.png"
          ]
        },
        {
          "type": "statement",
          "text": "Cousins share at least one set of grandparents.",
          "question": null,
          "answer": null,
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738425/hoshiyaar-test/pyhwojbtn47mbk6q1euy.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738715/hoshiyaar-test/n2foy4ful9lak3vu6fze.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "Cousins share at least one set of  g....p.....",
          "answer": "grandparents",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738425/hoshiyaar-test/pyhwojbtn47mbk6q1euy.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738715/hoshiyaar-test/n2foy4ful9lak3vu6fze.png"
          ]
        },
        {
          "type": "statement",
          "text": "Lakshman and Ram are siblings.",
          "question": null,
          "answer": null,
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738513/hoshiyaar-test/yypmxbugipr4drtvyxjz.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "multiple-choice",
          "text": null,
          "question": "Lakshman and Ram are siblings. Do Lakshman and Ram share a common father?",
          "answer": "Yes",
          "options": [
            "Yes",
            "No"
          ],
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738513/hoshiyaar-test/yypmxbugipr4drtvyxjz.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "multiple-choice",
          "text": null,
          "question": "Lakshman and Ram are siblings. Do Lakshman and Ram share a common mother?",
          "answer": "Yes",
          "options": [
            "Yes",
            "No"
          ],
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738513/hoshiyaar-test/yypmxbugipr4drtvyxjz.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "statement",
          "text": "Himesh and Ram are cousins.",
          "question": null,
          "answer": null,
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738425/hoshiyaar-test/pyhwojbtn47mbk6q1euy.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "multiple-choice",
          "text": null,
          "question": "Himesh and Ram are cousins. Do Himesh and Ram share a common grandfather?",
          "answer": "Yes",
          "options": [
            "Yes",
            "No"
          ],
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738425/hoshiyaar-test/pyhwojbtn47mbk6q1euy.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "multiple-choice",
          "text": null,
          "question": "Himesh and Ram are cousins. Do Himesh and Ram share a common grandmother?",
          "answer": "Yes",
          "options": [
            "Yes",
            "No"
          ],
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738425/hoshiyaar-test/pyhwojbtn47mbk6q1euy.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "multiple-choice",
          "text": null,
          "question": "Himesh and Ram are cousins. Do Himesh and Ram share a common father?",
          "answer": "No",
          "options": [
            "Yes",
            "No"
          ],
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738425/hoshiyaar-test/pyhwojbtn47mbk6q1euy.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "multiple-choice",
          "text": null,
          "question": "Himesh and Ram are cousins. Do Himesh and Ram share a common father?",
          "answer": "No",
          "options": [
            "Yes",
            "No"
          ],
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738425/hoshiyaar-test/pyhwojbtn47mbk6q1euy.png",
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738665/hoshiyaar-test/x3izl0wnovsaegqvel2e.png"
          ]
        },
        {
          "type": "statement",
          "text": "All people related to Ram through his mother or father are his family.",
          "question": null,
          "answer": null,
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738171/hoshiyaar-test/wxc4og9xx2ac9p4k91xs.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "All people related to Ram through his mother or father are his f.........",
          "answer": "family",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738171/hoshiyaar-test/wxc4og9xx2ac9p4k91xs.png"
          ]
        },
        {
          "type": "statement",
          "text": "Aunts, uncles, grandparents, siblings, and cousins are part of the family.",
          "question": null,
          "answer": null,
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738171/hoshiyaar-test/wxc4og9xx2ac9p4k91xs.png"
          ]
        },
        {
          "type": "fill-in-the-blank",
          "text": null,
          "question": "Aunts, uncles, grandparents, siblings, and cousins are part of the f..........",
          "answer": "family",
          "images": [
            "https://res.cloudinary.com/dcxlzfyfp/image/upload/v1760738171/hoshiyaar-test/wxc4og9xx2ac9p4k91xs.png"
          ]
        }
      ]
    }
  ]
};

async function importLessonData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hoshiyaar');
    console.log('Connected to MongoDB');

    // Step 1: Create or find Board
    let board = await Board.findOne({ name: lessonData.board_title });
    if (!board) {
      board = await Board.create({ name: lessonData.board_title });
      console.log(`Created board: ${board.name}`);
    } else {
      console.log(`Found existing board: ${board.name}`);
    }

    // Step 2: Create or find ClassLevel
    let classLevel = await ClassLevel.findOne({ 
      boardId: board._id, 
      name: lessonData.class_title.toString() 
    });
    if (!classLevel) {
      classLevel = await ClassLevel.create({ 
        boardId: board._id, 
        name: lessonData.class_title.toString(),
        order: lessonData.class_title
      });
      console.log(`Created class level: ${classLevel.name}`);
    } else {
      console.log(`Found existing class level: ${classLevel.name}`);
    }

    // Step 3: Create or find Subject
    let subject = await Subject.findOne({ 
      boardId: board._id, 
      classId: classLevel._id, 
      name: lessonData.subject_title 
    });
    if (!subject) {
      subject = await Subject.create({ 
        boardId: board._id, 
        classId: classLevel._id, 
        name: lessonData.subject_title 
      });
      console.log(`Created subject: ${subject.name}`);
    } else {
      console.log(`Found existing subject: ${subject.name}`);
    }

    // Step 4: Create or find Chapter
    let chapter = await Chapter.findOne({ 
      subjectId: subject._id, 
      title: lessonData.chapter_title 
    });
    if (!chapter) {
      chapter = await Chapter.create({ 
        subjectId: subject._id, 
        title: lessonData.chapter_title,
        order: 9 // Chapter 9
      });
      console.log(`Created chapter: ${chapter.title}`);
    } else {
      console.log(`Found existing chapter: ${chapter.title}`);
    }

    // Step 5: Create or find Unit
    let unit = await Unit.findOne({ 
      chapterId: chapter._id, 
      title: lessonData.unit_title 
    });
    if (!unit) {
      unit = await Unit.create({ 
        chapterId: chapter._id, 
        title: lessonData.unit_title,
        order: 1
      });
      console.log(`Created unit: ${unit.title}`);
    } else {
      console.log(`Found existing unit: ${unit.title}`);
    }

    // Step 6: Create Module (Lesson)
    const lesson = lessonData.lessons[0];
    let module = await Module.findOne({ 
      chapterId: chapter._id, 
      unitId: unit._id, 
      title: lesson.lesson_title 
    });
    if (!module) {
      module = await Module.create({ 
        chapterId: chapter._id, 
        unitId: unit._id, 
        title: lesson.lesson_title,
        order: 1
      });
      console.log(`Created module: ${module.title}`);
    } else {
      console.log(`Found existing module: ${module.title}`);
    }

    // Step 7: Create CurriculumItems (Concepts)
    console.log(`Creating ${lesson.concepts.length} curriculum items...`);
    
    for (let i = 0; i < lesson.concepts.length; i++) {
      const concept = lesson.concepts[i];
      
      // Check if this concept already exists
      const existingItem = await CurriculumItem.findOne({
        moduleId: module._id,
        order: i + 1,
        type: concept.type,
        question: concept.question,
        text: concept.text
      });

      if (!existingItem) {
        const curriculumItem = await CurriculumItem.create({
          moduleId: module._id,
          order: i + 1,
          type: concept.type,
          text: concept.text,
          question: concept.question,
          answer: concept.answer,
          options: concept.options || [],
          images: concept.images || []
        });
        console.log(`Created curriculum item ${i + 1}: ${concept.type}`);
      } else {
        console.log(`Curriculum item ${i + 1} already exists`);
      }
    }

    console.log('✅ Lesson data imported successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Board: ${board.name}`);
    console.log(`   - Class: ${classLevel.name}`);
    console.log(`   - Subject: ${subject.name}`);
    console.log(`   - Chapter: ${chapter.title}`);
    console.log(`   - Unit: ${unit.title}`);
    console.log(`   - Module: ${module.title}`);
    console.log(`   - Concepts: ${lesson.concepts.length}`);

  } catch (error) {
    console.error('❌ Error importing lesson data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the import
importLessonData();
