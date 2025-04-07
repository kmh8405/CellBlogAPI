document.addEventListener("DOMContentLoaded", function () {
    // 메뉴 클릭 시 서브메뉴 토글
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", function () {
            const targetId = this.getAttribute("data-target");
            const submenu = document.getElementById(targetId);
            if (submenu) {
                submenu.style.display = submenu.style.display === "block" ? "none" : "block";
            }
        });
    });

    // 메뉴의 하위 항목 클릭 시 내용 로드
    document.querySelectorAll(".submenu li").forEach(subitem => {
        subitem.addEventListener("click", function (event) {
            event.stopPropagation(); // 부모 요소 클릭 이벤트 방지
            event.preventDefault(); // 기본 링크 동작(페이지 새로고침)을 막기
            //클릭한 서브메뉴 항목에 맞는 콘텐츠 불러오기
            const contentId = this.getAttribute("data-content");
            const contentArea = document.getElementById("content-area");
    
            const contentMap = {
                "course1" : "course1.html",
                "course2" : "course2.html",
                "note1" : "note1.html",
                "note2" : "note2.html",
                "experiment1" : "experiments.html",
                "structure1" : "3D-Structure.html"
            };
            //iframe 생성을 통한 콘텐츠 삽입
            const iframe = document.createElement("iframe");
            iframe.src = contentMap[contentId];
            // iframe 로딩 후 카드 뒤집기 이벤트 추가
            iframe.onload = function() {
                const cards = iframe.contentWindow.document.querySelectorAll(".card");
                cards.forEach(card => {
                    card.addEventListener("click", function () {
                        this.classList.add("flipped");
                        const isCorrect = this.getAttribute("data-answer") === "true";
                        this.querySelector(".card-back").classList.add(isCorrect ? "correct" : "incorrect");
                    });
                });
            };

            // content-area를 비우고 iframe을 삽입
            contentArea.innerHTML = "";
            contentArea.appendChild(iframe);
        });
    });

    //📌jQuery 기반 PDB 단백질 데이터 가져오기
    $(document).ready(function () { //jQuery가 HTML 문서를 완전히 불러온 뒤 실행될 함수 정의
        $("#fetch-button").on("click", function () {
            let pdbId = $("#pdb-id").val().trim().toUpperCase(); //ID값 가져오기, 공백 제거(trim), 대문자 변환
            if (pdbId === "") {
                alert("PDB ID를 입력하세요!");
                return;
            }

            // RCSB PDB의 REST API 엔드포인트 URL 구성
            let apiUrl = `https://data.rcsb.org/rest/v1/core/entry/${pdbId}`;

            // 콘솔에 요청 URL을 출력 (디버깅용)
            console.log("🔍 Fetching data from:", apiUrl);

            // AJAX 요청
            $.ajax({
                url: apiUrl,
                method: "GET",
                dataType: "json",
                success: function (data) {
                    console.log("✅ Data received:", data);
                    
                    //DOI 정보 가져오기
                    let doi = "해당 없음"; //없는 경우를 대비해 기본값으로 해당없음 설정
                    if (data.citation && data.citation.length > 0) { //citation 정보가 존재하고, 그 길이가 0보다 크다면(논문 정보가 있으면)
                        // citation 배열에서 primary 논문 찾기
                        let primaryCitation = data.citation.find(cite => cite.id === "primary"); //citation배열에서 id가 primary인 항목을 찾음(주 논문)
                        if (primaryCitation && primaryCitation.pdbx_database_id_doi) {
                            doi = `<a href="https://doi.org/${primaryCitation.pdbx_database_id_doi}" target="_blank">${primaryCitation.pdbx_database_id_doi}</a>`;
                        } //primary 논문이 존재하고 DOI 정보가 있다면 DOI를 링크형태로 구성해서 변수에 저장
                    }

                    $("#protein-info").html(`
                        <p><b>🔹 PDB ID:</b> ${data.rcsb_entry_container_identifiers.entry_id}</p>
                        <p><b>🔹 분자량:</b> ${data.rcsb_entry_info.molecular_weight} Da</p>
                        <p><b>🔹 단백질 길이:</b> ${data.rcsb_entry_info.polymer_entity_count_protein} 개</p>
                        <p><b>🔹 DOI:</b> ${doi}</p>
                    `);

                    $("#viewer").html(`
                        <iframe src="https://www.rcsb.org/3d-view/${pdbId}" width="900" height="650" frameborder="0"></iframe>
                    `); //해당 PDB ID의 3D 뷰어 iframe 삽입
                },
                error: function (xhr, status, error) {
                    console.error("❌ AJAX Error:", status, error);
                    alert("PDB 데이터를 가져오는 중 오류가 발생했습니다!");
                }
            });
        });
    });

    //📌달력
    let currentDate = new Date();

    function getKoreaTime() {
        return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })); 
    } //현재 한국 시간을 반환하는 함수. 사용자 로컬 시간대와는 무관하게 한국 시간 기준으로 실행

    function updateCalendar(date) {
        //기준 날짜의 연도, 월 추출
        const year = date.getFullYear();
        const month = date.getMonth();
        //오늘 날짜를 한국 시간 기준으로 가져옴
        const today = getKoreaTime();

        //YYYY.MM 형식으로 현재 달 표시
        document.getElementById("month-this").textContent = `${year}.${(month + 1).toString().padStart(2, "0")}`;
            //JS의 date.getMonth()는 0부터 시작하므로 + 1
            //숫자를 문자열로 변환해야 문자열 조작이 가능하므로 toString()사용
            //padStart()는 지정된 길이까지 문자열 확장하는 함수. 최소 2자리로 만들고 앞자리를 "0"으로 채움

        const firstDay = new Date(year, month, 1).getDay(); //이번 달의 1일이 무슨 "요일"인지 (0 = 일요일 ... 6 = 토요일)
        const lastDate = new Date(year, month + 1, 0).getDate(); //이번 달이 며칠까지 있는지
        //달력 테이블의 tbody영역 초기화
        const calendarBody = document.getElementById("calendar-body");
        calendarBody.innerHTML = "";

        let dateNum = 1; //날짜 번호를 1일부터 시작
        for (let i = 0; i < 6; i++) { //최대 6줄(6주)까지 달력 행 생성 (2025.03 달력이 그 예시)
            let row = document.createElement("tr"); //새로운 행 생성
            //한 줄에 7개의 셀(요일) 생성
            for (let j = 0; j < 7; j++) {
                let cell = document.createElement("td");
                let cellLink = document.createElement("a");

                //첫 주에서 1일 시작 전의 공백 칸 처리
                if (i === 0 && j < firstDay) {
                    cell.appendChild(cellLink);
                } else if (dateNum > lastDate) { //마지막 날짜를 초과한 경우 반복 중단
                    break;
                } else { //날짜 셀에 실제 날짜 숫자 삽입
                    cellLink.textContent = dateNum;
                    cell.appendChild(cellLink);
                    
                    //현재 날짜(today)와 비교해서 같은 날짜면 .today 클래스 부여
                    if (year === today.getFullYear() && month === today.getMonth() && dateNum === today.getDate()) {
                        cell.classList.add("today");
                    }

                    dateNum++;
                }

                row.appendChild(cell); //셀을 현재 행에 추가
            }
            calendarBody.appendChild(row); //완성된 행을 달력 본문에 추가
            if (dateNum > lastDate) break; //마지막 날짜를 초과했다면 반복 중단
        }
    }

    //이전 달 보기 버튼 클릭 이벤트 - 현재 기준 날짜의 월을 1개월 이전으로 변경하고 달력 다시 그림
    document.getElementById("month-prev").addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar(currentDate);
    });

    //다음 달 보기 버튼 클릭 이벤트 - 현재 기준 날짜의 월을 1개월 이후로 변경하고 달력 다시 그림
    document.getElementById("month-next").addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar(currentDate);
    });

    updateCalendar(currentDate); //페이지가 처음 로드될 때 현재 날짜 기준으로 달력 표시
    setInterval(() => {
        let now = getKoreaTime();
        if (now.getDate() !== currentDate.getDate()) { //날짜가 바뀌었다면 달력 다시 그림
            currentDate = now;
            updateCalendar(currentDate);
        }
    }, 1000 * 60 * 60); // 1시간마다 갱신


    //📌메모장
    //메모를 저장하고 불러올 때 사용할 쿠키의 키 이름을 정의
    const memoCookieKey = "dailyMemo";

    //오늘 날짜를 문자열로 반환하는 함수 (형식: "YYYY-MM-DD")
    //쿠키의 날짜 비교 시 사용됨
    function getTodayDateString() {
        const now = new Date();
        return now.toISOString().slice(0, 10); // ISO형식에서 앞 10글자만 자름. YYYY-MM-DD
    }

    // 메모 저장 함수
    function saveMemosToCookie(memos) {
        const today = new Date(); //현재 시간
        const tomorrow = new Date(today); //복사해서 내일 자정 계산
        tomorrow.setDate(today.getDate() + 1); //날짜 + 1
        tomorrow.setHours(0, 0, 0, 0); // 자정 설정 00:00:00.000
    
        const expires = "expires=" + tomorrow.toUTCString(); //쿠키 만료일을 내일 자정으로 설정
        const data = { date: getTodayDateString(), memos }; //저장할 데이터 구조(날짜 + 메모 배열)
        //JSON으로 변환 → URI 인코딩 → 쿠키로 저장
        document.cookie = `${memoCookieKey}=${encodeURIComponent(JSON.stringify(data))}; ${expires}; path=/`;
            //쿠키는 특수문자를 직접 저장할 수 없음
            //따라서, JSON.stringify(data) 문자열을 URI에 인코딩해서 쿠키에 안전하게 저장하기 위해 encodeURIComponent 사용
            //path=/ 는 쿠키가 유효한 경로를 설정하기 위해 사용. / 이면 사이트 전체 경로에서 이 쿠키를 사용할 수 있다는 의미
    }
    

    //쿠키에서 메모 데이터를 불러오는 함수
    function loadMemosFromCookie() {
        const cookieArr = document.cookie.split("; "); //쿠키를 각각 분리
        for (const cookie of cookieArr) {
            const [name, value] = cookie.split("="); //이름과 값 분리
            if (name === memoCookieKey) { //이름이 우리가 저장한 메모 키와 같으면
                try { //JSON 형식으로 파싱 (에러 날 수 있으므로 try-catch)
                    const data = JSON.parse(decodeURIComponent(value));
                    if (data.date === getTodayDateString()) { //저장된 날짜가 오늘과 같으면 그 메모 반환
                        return data.memos;
                    }
                } catch (e) {
                    console.error("쿠키 파싱 오류", e);
                }
            }
        }
        return []; //유효한 메모가 없을 경우 빈 배열 반환
    }

    // 메모 항목 생성 함수
    function createMemoElement(text) { //새로운 메모 항목(li 요소)을 생성하는 함수
        const li = document.createElement("li"); //<li> 요소 생성
        li.textContent = text; //메모 내용 설정

        const delBtn = document.createElement("button"); //삭제 버튼 생성
        delBtn.textContent = "삭제";
        delBtn.style.marginLeft = "10px";
        delBtn.style.float = "right";
        //삭제 버튼 클릭 시: 삭제 확인 → li 제거 → 쿠키 업데이트
        delBtn.onclick = () => {
            if (confirm(`해당 메모("${text}")를 삭제하시겠습니까?`)) {
                li.remove();
                updateMemosInCookie();
            }
        };

        li.appendChild(delBtn); //메모 항목에 삭제 버튼 추가
        return li; //완성된 메모 항목 반환
    }

    //현재 화면에 있는 메모 목록을 쿠키에 저장하는 함수
    function updateMemosInCookie() {
        const listItems = document.querySelectorAll("#memo-list li"); //모든 <li> 가져오기
        //각 <li>에서 텍스트만 추출해서 배열로 만들기
        const memos = Array.from(listItems).map(li => li.childNodes[0].nodeValue.trim());
        saveMemosToCookie(memos); //저장
    }

    // 메모 추가 버튼 이벤트
    document.getElementById("add-memo-btn").addEventListener("click", () => { //"할 일 추가" 버튼 클릭 시 실행
        const memoText = prompt("할 일을 입력하세요:");
        //빈 문자열이 아니면 메모 추가
        if (memoText && memoText.trim() !== "") {
            const newMemo = createMemoElement(memoText.trim()); //메모 요소 생성
            document.getElementById("memo-list").appendChild(newMemo); //화면에 추가
            updateMemosInCookie(); //쿠키 저장
        }
    });

    // 페이지 로드시 메모 불러오기
    window.addEventListener("DOMContentLoaded", () => {
        const savedMemos = loadMemosFromCookie(); //쿠키에서 메모 로드
        const memoList = document.getElementById("memo-list"); //<ul> 요소
        //불러온 메모 하나씩 화면에 추가
        savedMemos.forEach(memo => {
            const li = createMemoElement(memo);
            memoList.appendChild(li);
        });
    });


    //최신 논문 끌어오기
    $(document).ready(function() {
        const searchTerm = "Molecular Biology";
        //PubMed에서 검색할 키워드 설정 (여기선 "Molecular Biology").
        const apiUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${searchTerm}&retmax=5&sort=date&retmode=json`;
            //db=pubmed : 검색할 데이터베이스는 PubMed
            //term=... : 검색어
            //retmax=5 : 최대 5개 결과
            //sort=date : 최신순 정렬
            //retmode=json : 결과는 JSON 형식

        $.ajax({
            url: apiUrl,
            method: "GET",
            dataType: "json",
            success: function(data) {
                if (data.esearchresult.idlist.length > 0) { //검색 결과가 하나 이상 있는지 확인
                    let pmids = data.esearchresult.idlist.join(","); //PubMed ID(PMID)들을 콤마로 이어서 문자열로 변환 (다음 API에 사용할 수 있도록)
                    getPaperDetails(pmids); //논문 상세정보를 가져오는 함수 호출
                } else {
                    $("#paper-container").html("<p>논문을 찾을 수 없습니다.</p>"); //결과가 없을 경우 안내 문구 출력
                }
            },
            error: function() {
                $("#paper-container").html("<p>API 요청 실패</p>"); //요청 실패 시 에러 메시지 출력
            }
        });

        function getPaperDetails(pmids) { //논문들의 상세 정보를 가져오는 함수 (논문 제목, 링크 등).
            //PubMed ESummary API URL 생성
            const detailsUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids}&retmode=json`;

            $.ajax({
                url: detailsUrl,
                method: "GET",
                dataType: "json", //ESummary API로 논문 정보 요청 (JSON 형식)
                success: function(data) {
                    let paperList = []; //성공 시 논문 목록을 저장할 배열 생성
                    $.each(data.result, function(key, value) { //받아온 JSON 데이터를 하나씩 순회
                        if (key !== "uids") { //"uids"는 목록 정보로 실제 논문이 아님 → 제외
                            let title = value.title;
                            let link = `https://pubmed.ncbi.nlm.nih.gov/${value.uid}/`; //논문 제목과 링크 추출
                            paperList.push({ pmid: value.uid, title, link });
                        }
                    });

                    getPaperAbstracts(paperList); //각 논문 정보들을 모은 후 초록(abstract)을 가져오는 함수 호출.
                },
                error: function() {
                    $("#paper-container").html("<p>논문 정보를 가져오는 데 실패했습니다.</p>");
                }
            });
        }

        //논문 초록을 가져오는 함수
        function getPaperAbstracts(paperList) {
            let completedRequests = 0; //AJAX 완료 횟수 추적용 변수
            $("#paper-container").empty(); // 기존 논문 초기화

            paperList.forEach((paper, index) => { //각 논문에 대해 반복
                //EFetch API URL 생성 (abstract는 XML로 받음).
                const abstractUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${paper.pmid}&retmode=xml`;

                $.ajax({
                    url: abstractUrl,
                    method: "GET",
                    dataType: "xml", //초록 요청 (XML로)
                    success: function(xml) {
                        //// XML에서 <AbstractText> 내용 추출 (없으면 기본 문구)
                        let abstractText = $(xml).find("AbstractText").first().text() || "초록이 제공되지 않습니다.";
                        //초록을 요약 (앞 문장 몇 개만 남김)
                        let shortAbstract = summarizeAbstract(abstractText);

                        //논문 HTML 구조 생성 (링크 + 요약 포함, 처음엔 숨김)
                        let paperHtml = `
                            <div class="paper-item" style="display: none;">
                                <a href="${paper.link}" target="_blank">${paper.title}</a>
                                <p class="paper-abstract">${shortAbstract}</p>
                            </div>
                        `;
                        $("#paper-container").append(paperHtml);
                    },
                    complete: function() { //요청 완료 후 실행
                        completedRequests++;
                        if (completedRequests === paperList.length && paperList.length === 5) {
                            $(".paper-item").hide(); // 모든 논문을 숨기고
                            $(".paper-item:first").fadeIn(); // 첫 번째 논문만 표시
                            startSlideshow(); //애니메이션 시작
                        }
                    }
                });
            });
        }

        let slideInterval;
        let currentIndex = 0; //슬라이드쇼 관련 변수

        function startSlideshow() {
            let items = $(".paper-item");

            if (items.length === 0) return; //논문이 없으면 종료

            items.hide().eq(currentIndex).show(); //현재 논문만 표시

            slideInterval = setInterval(function() {
                let nextIndex = (currentIndex + 1) % items.length;

                items.eq(currentIndex).fadeOut(600, function() {
                    items.eq(nextIndex).fadeIn(600);
                    currentIndex = nextIndex;
                });
            }, 4000); //4초마다 다음 논문으로 전환 (페이드 효과)
        }

        //슬라이드쇼 정지
        function stopSlideshow() {
            clearInterval(slideInterval);
        }

        //마우스 올리면 멈추고, 내리면 다시 슬라이드 재생
        $("#paper-container").on("mouseenter", function() {
            stopSlideshow();
        });

        $("#paper-container").on("mouseleave", function() {
            if ($(".paper-item").length > 0) {
                startSlideshow();
            }
        });

        //초록 요약 함수 → 앞 문장 3개만 표시. 마침표 처리도 추가
        function summarizeAbstract(text) {
            let sentences = text.split(". ");
            let shortText = sentences.slice(0, 3).join(". ");
            return shortText.endsWith(".") ? shortText : shortText + ".";
        }
    });
});
