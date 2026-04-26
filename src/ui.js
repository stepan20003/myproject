export const zonesData = [
    {
        id: 'terminal',
        name: 'Terminal',
        color: '#00f5ff',
        pos: { x: 0, y: 0, z: -5 },
        content: `
            <div class="zone-label" style="color: #00f5ff">About Me</div>
            <h2>STEPAN STEPANYAN_</h2>
            <p>IT Student &middot; Yerevan, Armenia</p>
            <p>I build things close to the metal.<br>
            C, Python, Linux &mdash; from algorithms to systems.<br>
            Currently at 42 Yerevan & NPUA.</p>
            <p>Ready to relocate &middot; Available within 1 month</p>
        `
    },
    {
        id: 'billboard',
        name: 'Billboard',
        color: '#ff00c8',
        pos: { x: -8, y: 0, z: -15 },
        content: `
            <div class="zone-label" style="color: #ff00c8">Projects</div>
            <h2>PROJECTS</h2>
            <div class="project-grid">
                <div class="project-card">
                    <h3>libft.h</h3>
                    <p>Custom C standard library from scratch</p>
                    <a href="https://github.com/stepan20003/libft.h" target="_blank">→ github.com/.../libft.h</a>
                </div>
                <div class="project-card">
                    <h3>push_swap</h3>
                    <p>Sorting algorithm visualizer in C</p>
                    <a href="https://github.com/stepan20003/push_swap" target="_blank">→ github.com/.../push_swap</a>
                </div>
            </div>
        `
    },
    {
        id: 'tags',
        name: 'Alley Tags',
        color: '#9d00ff',
        pos: { x: 8, y: 0, z: -20 },
        content: `
            <div class="zone-label" style="color: #9d00ff">Skills</div>
            <h2>SKILLS</h2>
            <div class="skill-tags">
                <span class="skill-tag">C</span>
                <span class="skill-tag">Python</span>
                <span class="skill-tag">Bash</span>
                <span class="skill-tag">Shell</span>
                <span class="skill-tag">Linux</span>
                <span class="skill-tag">SQL</span>
                <span class="skill-tag">Assembler</span>
                <span class="skill-tag">OOP</span>
                <span class="skill-tag">Data Structures</span>
                <span class="skill-tag">Git</span>
                <span class="skill-tag">Algorithms</span>
            </div>
        `
    },
    {
        id: 'phone',
        name: 'Phone Booth',
        color: '#ffaa00',
        pos: { x: 5, y: 0, z: -8 },
        content: `
            <div class="zone-label" style="color: #ffaa00">Contact</div>
            <h2>📡 GET IN TOUCH</h2>
            <p>✉ <a href="mailto:stepanyanstepan00@gmail.com">stepanyanstepan00@gmail.com</a></p>
            <p>📞 +374 094 152 524</p>
            <p>🌐 <a href="https://github.com/stepan20003" target="_blank">github.com/stepan20003</a></p>
            <p>Based in Yerevan &middot; Open to remote & relocation</p>
        `
    },
    {
        id: 'rooftop',
        name: 'Rooftop',
        color: '#00f5ff',
        pos: { x: 12, y: 5, z: -12 },
        content: `
            <div class="zone-label" style="color: #00f5ff">Education</div>
            <h2>🎓 EDUCATION</h2>
            <p><strong>42 YEREVAN</strong><br>
            Certificate &middot; Jan 2026 – Present<br>
            Peer-to-peer coding school. Real projects, no lectures, no teachers.</p>
            <p><strong>NPUA — Information Systems</strong><br>
            Bachelor's Degree &middot; Sep 2024 – Present</p>
        `
    }
];

export function initUI() {
    const container = document.getElementById('ui-container');
    zonesData.forEach(zone => {
        const panel = document.createElement('div');
        panel.id = `panel-${zone.id}`;
        panel.className = 'info-panel';
        panel.innerHTML = zone.content;
        container.appendChild(panel);
    });
}

export function showPanel(id) {
    const panels = document.querySelectorAll('.info-panel');
    panels.forEach(p => p.classList.remove('active'));
    if (id) {
        const target = document.getElementById(`panel-${id}`);
        if (target) target.classList.add('active');
    }
}
