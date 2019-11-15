# Performance Issue Reporting

Performance issues are hard to track down, and a good report is necessary for fixing them.

In addition to the normal issues, please include a profile in performance-related issues.

## Profiling

This extension launches a language server. Perf issue is mostly caused by the language server. Here's how to profile it.

- You need Chrome for profiling.
- Set `scss.dev.serverPort` to a number, say `8000`.
- Open [chrome://inspect/](chrome://inspect/) in Chrome.
- You should see a Node.js remote target like below. That's the VLS process. Click it.
    ![image](https://user-images.githubusercontent.com/4033249/56996577-d61d0c00-6b59-11e9-85f0-29dc15e2e2aa.png)
    - If you don't see the target, click `Open dedicated DevTools for Node` and in the `Connection` tab, click `Add connection` and add `localhost:<scss.dev.serverPort>`
- Go to the `Profiler` tab. Click `Start`.
- Edit some SCSS files in your editor.
- Click `Stop`.
- Save the profile. Zip it and attach to issue report.
