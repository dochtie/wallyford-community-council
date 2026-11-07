# Wallyford Community Council website

A simple website for Wallyford Community Council, built with [Jekyll](https://jekyllrb.com/) so that GitHub Pages can host it for free.

## Pages

| Page | File |
| --- | --- |
| Home | `index.html` |
| What's on (every date for the next twelve months) | `whats-on.html` |
| History (village history, mining, the Bing, the Drift) | `wallyford.html` |
| The Community Council (remit, who we are, meetings, Torchlight Parade) | `council.html` |
| Local groups (community groups, TRAs, Neighbourhood Watch) | `groups.html` |
| Report it | `report.html` |
| You said, we did | `you-said-we-did.html` |
| Community Speedwatch (how it works, the four areas, volunteering) | `speedwatch.html` |

## Everyday updates (no coding needed)

You can edit any of these files on github.com: open the file, click the pencil icon, make the change, then click **Commit changes**. The live site updates a minute or two later.

**If the site hasn't updated after 15 minutes:** open the **Actions** tab on GitHub and click the newest *pages build and deployment* run. If it failed, click **Re-run all jobs**. If it's stuck on *Queued*, the problem is on GitHub's side: wait, or make any new change, which starts a fresh run that publishes everything. Your changes are safe either way.

- **Contact details, Facebook link, meeting details:** `_config.yml`
- **Councillors (names, roles, photos, blurbs):** `_data/councillors.yml`. Put photos in `assets/img/people/` and add the file name to `photo:`.
- **Local groups:** `_data/groups.yml`
- **Coming up (home page) and What's on:** the home page shows the next four dates; the *What's on* page shows everything in the next twelve months, month by month. **Every date comes from the Upcoming dates tab of the website sheet** (see below); the website doesn't work any out by itself. Put each event on its own row and tick *Show on website*. Past events disappear by themselves, and the same event typed twice on the same day only shows once.
  - Rows with *Community Council Meeting* in the Event column also set the "next meeting" date on the Council, Report it and You said, we did pages, and a row with *Torchlight* in it sets the "This year:" date on the Council page. Without one, those pages show their general wording (for meetings, `meeting_rule` in `_config.yml`).
  - If you leave the Link blank, meetings, the Torchlight Parade, Remembrance/Armistice and the Pinkie commemoration link to the right part of this website.
- **Ward councillors (Report it page):** `_data/ward_councillors.yml`. Check after each council election.
- **You said, we did, Upcoming dates and Speedwatch results:** you don't edit the website at all. Update the website sheet and the pages pick up the changes (see below).
- **Speedwatch areas (Up and running / Getting set up):** `_data/speedwatch.yml`. When Wallyford's scheme starts, change its status to `Up and running`.

## The website sheet

One Google Sheet in Drive, *Wallyford CC - Website updates*, feeds three parts of the site. Its **How to use** tab explains every column.

| Tab | Shows on | What to add |
| --- | --- | --- |
| **Tracker** | *You said, we did*, and the latest three on the home page | An issue residents raised and what the Community Council did |
| **Upcoming dates** | The *Coming up* box on the home page, the *What's on* page, the "next meeting" dates and the Torchlight Parade date | Every date: meetings, Remembrance, the Torchlight Parade, Gala Day and anything else. Date, time, event, place and an optional link |
| **Speedwatch** | The Speedwatch page (results counter is switched off for now) | One row per Speedwatch session |

Only rows with **Show on website** ticked appear. The website reads the sheet each time someone opens a page, and Google can take up to 5 minutes to pass on changes.

The sheet is published with **File > Share > Publish to web > Entire document**, so any tab you add is public too. Each tab's CSV link is in `_config.yml` (`tracker_csv_url`, `events_csv_url`, `speedwatch_csv_url`): they're the same published link with a different `gid` number. Don't stop publishing the sheet, or the lists on the website will go blank.

Never put residents' names or contact details, vehicle registrations or volunteers' names in the sheet.

**Backup of the dates:** every night GitHub saves a copy of the Upcoming dates tab into the website (`assets/data/events-backup.csv`, by `.github/workflows/backup-dates.yml`). If the sheet can't be read (deleted, unpublished, a column heading renamed, or Google is down), the site shows the dates from that copy instead, so they're at most a day old. To back up straight away: **Actions** tab > *Back up the website dates* > **Run workflow**. A failed run means something's wrong with the sheet, and its message says what; the last good copy is kept. GitHub pauses nightly jobs after 60 days without any change to the repository and emails you first: click **Enable workflow** in the Actions tab to restart it.

If you ever make a new sheet, keep the same column headings and set **File > Settings > Locale** to *United Kingdom*, so dates are read as day/month.

**You said, we did:** the page has a **Completed** section at the top, then an **Ongoing** section (and a **Closed** one if any entries are closed), each with the most recently updated first. The home page shows the three most recently updated entries, whether ongoing or completed. (Older rows marked *Done* show as *Completed*.) For an automatic "Last updated" date, paste `tools/tracker-auto-date.gs` into the sheet once (Extensions > Apps Script, paste, Save). After that, editing "You said", "We did", "Status" or "Show on website" sets "Last updated" to today.

**Speedwatch:** the results counter is switched off. To put it back, set `speedwatch_show_results: true` in `_config.yml`. It then shows running totals (vehicles checked, how many were over the limit, and the share who kept to the limit) as rolling odometer-style counters, plus a list of recent sessions. Until there are results, the counters spin with a "No results yet" message.

While a sheet link is empty and draft mode is on, the pages show clearly labelled previews from `assets/data/tracker-preview.csv` and `assets/data/speedwatch-preview.csv`.

## Before going live

- Set `show_review_notes: false` in `_config.yml`. This hides the purple "Please check" and "To fill in" notes, which are there for the Community Council to work through.
- Add councillor photos and blurbs, and contact details or links for the local groups.
- Check that you have permission to use every photo.

## Getting on Google

The site is already set up for search engines (page titles and descriptions, a sitemap, structured data describing the council, and sharing previews for Facebook). While `show_review_notes` is `true`, every page tells search engines **not** to list it, so draft notes never end up on Google. Setting it to `false` lifts that automatically.

On launch day:

1. Set `show_review_notes: false` in `_config.yml`.
2. Go to [Google Search Console](https://search.google.com/search-console), add a **URL prefix** property for `https://dochtie.github.io/wallyford-community-council/`.
3. Choose **HTML tag** verification. Copy just the code from inside `content="..."` and paste it into `google_site_verification` in `_config.yml`. Wait a couple of minutes for the site to update, then click **Verify**.
4. In Search Console, open **Sitemaps** and submit `sitemap.xml`.
5. Use **URL inspection** on the home page and click **Request indexing**.

Links from other trusted sites help most: ask East Lothian Council (Connected Communities team) to add the website to the council's listing, and add it to the Facebook group's About section.

If you move to your own web address later, add it in Search Console as a new property and submit the sitemap again.

## Turning on GitHub Pages

In the repository on GitHub: **Settings > Pages**. Under *Build and deployment*, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save. The site appears at `https://dochtie.github.io/wallyford-community-council/`.

If you later buy a web address (for example `wallyfordcc.org.uk`), add it under **Settings > Pages > Custom domain** and change `baseurl` to `""` in `_config.yml`.

## Previewing on your own computer (optional)

```
gem install jekyll
jekyll serve
```

Then open http://localhost:4000/wallyford-community-council/.
