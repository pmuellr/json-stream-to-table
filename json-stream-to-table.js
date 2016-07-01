#!/usr/bin/env node

'use strict'

const readline = require('readline')

const yargs = require('yargs')
const lodash = require('lodash')

const util = require('./lib/util')

exports.main = main

if (require.main === module) main()

// main entry point
function main () {
  const argv = yargs
    .alias('h', 'help')
    .alias('d', 'debug')
    .alias('l', 'lines')
    .alias('t', 'time')
    .boolean('help')
    .boolean('debug')
    .number('lines')
    .number('time')
    .argv

  const args = argv._

  if (argv.help || args[0] === '?') return util.help()

  if (argv.debug) util.debugLog = util.log

  util.debugLog('parsed args: %s', JSON.stringify(argv, null, 2))

  if (argv.lines == null && argv.time == null) argv.time = 5

  const config = {}

  if (argv.lines) config.lines = argv.lines
  if (argv.time) config.time = argv.time

  const context = {}
  context.config = config
  context.buffer = initBuffer()

  const rl = readline.createInterface({input: process.stdin})

  rl.on('line', (line) => processLine(context, line))
  rl.on('close', () => processBuffer(context))
}

// Process a single line.
function processLine (context, line) {
  const object = parseJSON(line)
  if (object == null) return

  context.buffer.objects.push(object)

  if (!shouldProcessBuffer(context)) return

  processBuffer(context)
}

// Return boolean indicating whether we should process the buffer.

function shouldProcessBuffer (context) {
  const config = context.config
  const buffer = context.buffer

  if (config.lines != null) {
    if (buffer.objects.length >= config.lines) return true
  }

  if (config.time != null) {
    const elapTime = (Date.now() - context.buffer.start) / 1000
    if (elapTime > config.time) return true
  }

  return false
}

function processBuffer (context) {
  const objects = context.buffer.objects

  const cols = getPropertiesFromObjects(objects)

  const colWidths = new Map()

  const legend = []
  const sep = []
  for (let col of cols) {
    const colWidth = getMaxWidthOfPropertyFromObjects(objects, col)
    colWidths.set(col, colWidth)

    legend.push(util.left(col, colWidth))
    sep.push(util.left('', colWidth, '-'))
  }

  console.log(legend.join('  '))
  console.log(sep.join('  '))

  for (let object of objects) {
    const line = []
    for (let col of cols) {
      const colWidth = colWidths.get(col)

      let val = object[col]
      if (val == null) val = ''
      if (typeof val === 'number') {
        val = util.right(val, colWidth)
      } else {
        val = util.left(val, colWidth)
      }

      line.push(val)
    }

    console.log(line.join('  '))
  }

  console.log('')

  initBuffer(context.buffer)
}

// Get the max width of the specified property in the objects passed in.
function getMaxWidthOfPropertyFromObjects (objects, prop) {
  let max = prop.length

  for (let object of objects) {
    const val = object[prop]
    if (val == null) continue

    max = Math.max(max, `${val}`.length)
  }

  return max
}

// Get all the properties of the objects passed in.
function getPropertiesFromObjects (objects) {
  const props = new Map()

  let order = 0
  for (let object of objects) {
    if (lodash.isArray(object)) continue
    if (typeof object !== 'object') continue

    for (let prop in object) {
      if (props.has(prop)) continue

      props.set(prop, order)
      order++
    }
  }

  const entries = Array.from(props.entries()) // [['a',0], ['b',1]]
  entries.sort((e1, e2) => e1[1] - e2[1])

  return entries.map((e) => e[0])
}

// Parse JSON, returning null if invalid, or null.
function parseJSON (jsonString) {
  try {
    return JSON.parse(jsonString)
  } catch (err) {
    return null
  }
}

// Initialize a buffer.
function initBuffer (buffer) {
  buffer = buffer || {}

  buffer.start = Date.now()
  buffer.objects = []

  return buffer
}
